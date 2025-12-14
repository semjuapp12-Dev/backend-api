// src/controllers/eventoController.js

const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Evento = require("../models/Evento");

// ------------------------------------------------------------------
// 🔹 MULTER CONFIG
// ------------------------------------------------------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Apenas imagens são permitidas"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

exports.upload = upload;

// ------------------------------------------------------------------
// 🔹 HELPERS
// ------------------------------------------------------------------
const parseJSONSafe = (value) => {
  if (!value) return undefined;

  if (Array.isArray(value)) {
    if (
      value.length === 1 &&
      typeof value[0] === "string" &&
      value[0].startsWith("[")
    ) {
      try {
        return JSON.parse(value[0]);
      } catch {
        return undefined;
      }
    }
    return value;
  }

  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return undefined;
    }
  }

  return undefined;
};

// ------------------------------------------------------------------
// 🔹 LISTAR EVENTOS
// ------------------------------------------------------------------
exports.listEventos = async (req, res) => {
  try {
    const eventos = await Evento.find().sort({ data: 1 });
    res.status(200).json(eventos);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar eventos" });
  }
};

// ------------------------------------------------------------------
// 🔹 BUSCAR EVENTO POR ID
// ------------------------------------------------------------------
exports.getEventoById = async (req, res) => {
  try {
    const evento = await Evento.findById(req.params.id);
    if (!evento) {
      return res.status(404).json({ message: "Evento não encontrado" });
    }
    res.status(200).json(evento);
  } catch {
    res.status(500).json({ message: "Erro ao buscar evento" });
  }
};

// ------------------------------------------------------------------
// 🔹 CRIAR EVENTO
// ------------------------------------------------------------------
exports.createEvento = async (req, res) => {
  try {
    const dadosEvento = { ...req.body };

    dadosEvento.tags = parseJSONSafe(dadosEvento.tags) ?? [];
    dadosEvento.contatos = parseJSONSafe(dadosEvento.contatos) ?? [];
    dadosEvento.conteudos = parseJSONSafe(dadosEvento.conteudos) ?? [];

    dadosEvento.destacado = dadosEvento.destacado === "true";
    dadosEvento.xp = Number(dadosEvento.xp || 0);
    dadosEvento.vagas = Number(dadosEvento.vagas || 0);

    if (req.file) {
      dadosEvento.imagem = `uploads/${req.file.filename}`;
    }

    const eventoSalvo = await new Evento(dadosEvento).save();
    res.status(201).json(eventoSalvo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao criar evento" });
  }
};

// ------------------------------------------------------------------
// 🔹 ATUALIZAR EVENTO (🔥 CORRETO E SEGURO)
// ------------------------------------------------------------------
exports.updateEvento = async (req, res) => {
  try {
    const { id } = req.params;
    const dadosAtualizados = {};

    // 🔹 CAMPOS SIMPLES
    if (req.body.titulo !== undefined) dadosAtualizados.titulo = req.body.titulo;
    if (req.body.descricao !== undefined) dadosAtualizados.descricao = req.body.descricao;
    if (req.body.organizador !== undefined) dadosAtualizados.organizador = req.body.organizador;
    if (req.body.local !== undefined) dadosAtualizados.local = req.body.local;
    if (req.body.status !== undefined) dadosAtualizados.status = req.body.status;

    // 🔹 TAGS, CONTATOS, CONTEÚDOS
    if (req.body.tags !== undefined)
      dadosAtualizados.tags = parseJSONSafe(req.body.tags);

    if (req.body.contatos !== undefined)
      dadosAtualizados.contatos = parseJSONSafe(req.body.contatos);

    if (req.body.conteudos !== undefined)
      dadosAtualizados.conteudos = parseJSONSafe(req.body.conteudos);

    // 🔹 DESTACADO, XP
    if (req.body.destacado !== undefined)
      dadosAtualizados.destacado = req.body.destacado === true || req.body.destacado === "true";

    if (req.body.xp !== undefined)
      dadosAtualizados.xp = Number(req.body.xp);

    // 🔹 ACESSO E VAGAS
    if (req.body.acesso !== undefined) dadosAtualizados.acesso = req.body.acesso;

    if (req.body.vagas !== undefined) {
      const vagasNum = Number(req.body.vagas);
      dadosAtualizados.vagas = isNaN(vagasNum) ? 0 : vagasNum;
    }

    // 🔹 IMAGEM
    if (req.file) {
      const eventoAntigo = await Evento.findById(id);

      if (
        eventoAntigo?.imagem &&
        fs.existsSync(path.join(__dirname, "../../", eventoAntigo.imagem))
      ) {
        fs.unlinkSync(path.join(__dirname, "../../", eventoAntigo.imagem));
      }

      dadosAtualizados.imagem = `uploads/${req.file.filename}`;
    }

    // 🔹 UPDATE SEGURO
    const eventoAtualizado = await Evento.findByIdAndUpdate(
      id,
      { $set: dadosAtualizados },
      { new: true, runValidators: true }
    );

    if (!eventoAtualizado) {
      return res.status(404).json({ message: "Evento não encontrado" });
    }

    res.status(200).json(eventoAtualizado);
  } catch (error) {
    console.error("Erro ao atualizar evento:", error);
    res.status(500).json({ message: "Erro ao atualizar evento" });
  }
};

// ------------------------------------------------------------------
// 🔹 DELETAR EVENTO
// ------------------------------------------------------------------
exports.deleteEvento = async (req, res) => {
  try {
    const evento = await Evento.findById(req.params.id);
    if (!evento) {
      return res.status(404).json({ message: "Evento não encontrado" });
    }

    if (
      evento.imagem &&
      fs.existsSync(path.join(__dirname, "../../", evento.imagem))
    ) {
      fs.unlinkSync(path.join(__dirname, "../../", evento.imagem));
    }

    await Evento.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Evento deletado com sucesso" });
  } catch {
    res.status(500).json({ message: "Erro ao deletar evento" });
  }
};
