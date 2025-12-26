// src/controllers/eventoController.js

const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Evento = require("../models/Evento");
const User = require("../models/User");


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


    // 🔹 DATAS
    if (req.body.data !== undefined) dadosAtualizados.data = new Date(req.body.data);
    


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

// ------------------------------------------------------------------
// 🔹 CHECK-IN EM EVENTO
// ------------------------------------------------------------------
exports.checkinEvento = async (req, res) => {
  try {
    const userId = req.user.id;
    const eventoId = req.params.id;

    // Busca o evento
    const evento = await Evento.findById(eventoId);
    if (!evento) {
      return res.status(404).json({ message: "Evento não encontrado", type: "not_found" });
    }

    // Só permite check-in se o evento estiver em andamento
    if (evento.status !== "Ongoing") {
      return res.status(200).json({
        message: "Check-in permitido apenas para eventos em andamento",
        type: "invalid_status",
      });
    }

    // Busca o usuário
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado", type: "not_found" });
    }

    // Verifica se já fez check-in neste evento
    const jaFezCheckin = user.historicoCheckins.some(
      (c) => c.tipo === "Evento" && c.refId.toString() === eventoId
    );

    if (jaFezCheckin) {
      return res.status(200).json({
        message: "Você já fez check-in neste evento",
        type: "duplicate",
      });
    }

    // Adiciona XP ao usuário
    user.xp += evento.xp;

    // Salva check-in no histórico com XP ganho
    user.historicoCheckins.push({
      tipo: "Evento",
      refId: evento._id,
      xpGanho: evento.xp,
      checkinEm: new Date()
    });

    // Salva alterações (middleware recalcula nível automaticamente)
    await user.save();

    res.status(200).json({
      message: "Check-in realizado com sucesso!",
      xpGanho: evento.xp,
      xpTotal: user.xp,
      nivelAtual: user.nivel,
      type: "success",
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erro ao realizar check-in",
      type: "server_error"
    });
  }
};



// ------------------------------------------------------------------
// 🔹 INSCRIÇÃO EM EVENTO PRIVADO
// ------------------------------------------------------------------
exports.inscreverEvento = async (req, res) => {
  try {
    const userId = req.user.id;
    const eventoId = req.params.id;

    // 🔹 Busca o evento
    const evento = await Evento.findById(eventoId);
    if (!evento) {
      return res.status(404).json({
        message: "Evento não encontrado",
        type: "not_found",
      });
    }

    // 🔹 REGRA DE STATUS (🔥 NOVO)
    if (evento.status !== "Upcoming") {
      const mensagens = {
        Ongoing: "Inscrições encerradas. O evento já está em andamento.",
        Completed: "Este evento já foi concluído.",
        Cancelled: "Este evento foi cancelado.",
      };

      return res.status(403).json({
        message:
          mensagens[evento.status] ||
          "Inscrição não permitida para este evento",
        status: evento.status,
        type: "invalid_status",
      });
    }

    // 🔹 Verifica se é privado
    if (evento.acesso !== "Privado") {
      return res.status(403).json({
        message: "Este evento não permite inscrição privada",
        type: "forbidden",
      });
    }

    // 🔹 Verifica vagas
    if (evento.vagas !== null && evento.vagasOcupadas >= evento.vagas) {
      return res.status(400).json({
        message: "Evento lotado",
        vagasTotais: evento.vagas,
        vagasOcupadas: evento.vagasOcupadas,
        vagasDisponiveis: 0,
        type: "full",
      });
    }

    // 🔹 Busca usuário
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "Usuário não encontrado",
        type: "not_found",
      });
    }

    // 🔹 Evita inscrição duplicada
    user.eventosInscritos = user.eventosInscritos || [];
    const jaInscrito = user.eventosInscritos.some(
      (id) => id.toString() === eventoId
    );

    if (jaInscrito) {
      return res.status(200).json({
        message: "Usuário já inscrito neste evento",
        type: "duplicate",
      });
    }

    // 🔹 Atualiza vagas
    await Evento.findByIdAndUpdate(eventoId, {
      $inc: { vagasOcupadas: 1 },
    });

    // 🔹 Salva inscrição no usuário
    user.eventosInscritos.push(evento._id);
    await user.save();

    const vagasDisponiveis =
      evento.vagas !== null
        ? evento.vagas - (evento.vagasOcupadas + 1)
        : "Ilimitadas";

    res.status(200).json({
      message: "Inscrição realizada com sucesso",
      vagasTotais: evento.vagas,
      vagasOcupadas: evento.vagasOcupadas + 1,
      vagasDisponiveis,
      type: "success",
    });

  } catch (error) {
    console.error("Erro na inscrição do evento:", error);
    res.status(500).json({
      message: "Erro ao realizar inscrição",
      type: "server_error",
    });
  }
};


// ------------------------------------------------------------------
// 🔹 CANCELAR INSCRIÇÃO EM EVENTO
// ------------------------------------------------------------------
exports.cancelarInscricaoEvento = async (req, res) => {
  try {
    const userId = req.user.id;
    const eventoId = req.params.id;

    // 🔹 Busca evento
    const evento = await Evento.findById(eventoId);
    if (!evento) {
      return res.status(404).json({
        message: "Evento não encontrado",
        type: "not_found",
      });
    }

    // 🔹 Busca usuário
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "Usuário não encontrado",
        type: "not_found",
      });
    }

    // 🔹 Verifica se está inscrito
    const index = user.eventosInscritos.findIndex(
      (id) => id.toString() === eventoId
    );

    if (index === -1) {
      return res.status(400).json({
        message: "Usuário não está inscrito neste evento",
        type: "not_subscribed",
      });
    }

    // 🔹 Remove inscrição do usuário
    user.eventosInscritos.splice(index, 1);
    await user.save();

    // 🔹 Atualiza vagas (não deixa negativo)
    if (evento.vagas !== null && evento.vagasOcupadas > 0) {
      await Evento.findByIdAndUpdate(eventoId, {
        $inc: { vagasOcupadas: -1 },
      });
    }

    res.status(200).json({
      message: "Inscrição cancelada com sucesso",
      type: "success",
    });

  } catch (error) {
    console.error("Erro ao cancelar inscrição:", error);
    res.status(500).json({
      message: "Erro ao cancelar inscrição",
      type: "server_error",
    });
  }
};



// ------------------------------------------------------------------
// 🔹 LISTAR EVENTOS INSCRITOS DO USUÁRIO
// ------------------------------------------------------------------
exports.listarEventosInscritos = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId)
      .populate({
        path: "eventosInscritos",
        options: { sort: { data: 1 } }, // ordena por data
      });

    if (!user) {
      return res.status(404).json({
        message: "Usuário não encontrado",
        type: "not_found",
      });
    }

    res.status(200).json(user.eventosInscritos || []);
  } catch (error) {
    console.error("Erro ao listar eventos inscritos:", error);
    res.status(500).json({
      message: "Erro ao listar eventos inscritos",
      type: "server_error",
    });
  }
};



