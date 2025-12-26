// src/controllers/cursoController.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Curso = require('../models/Curso');
const User = require("../models/User");

// -------------------- MULTER CONFIG --------------------
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../uploads/'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Apenas imagens são permitidas'), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
exports.upload = upload;

// -------------------- HELPERS --------------------
const parseJSONSafe = (value) => {
    if (!value) return [];
    if (Array.isArray(value) && value.length === 1 && typeof value[0] === 'string' && value[0].startsWith('[')) {
        try { return JSON.parse(value[0]); } catch { return []; }
    }
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
        try { return JSON.parse(value); } catch { return []; }
    }
    return [];
};

// Adiciona ID único para contatos e conteúdos
const addIds = (arr) => arr.map(item => ({ id: Date.now() + Math.random(), ...item }));

// -------------------- CRUD --------------------
exports.listCursos = async (req, res) => {
    try {
        const cursos = await Curso.find().sort({ dataInicio: 1 });
        res.status(200).json(cursos);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar cursos', error: error.message });
    }
};

exports.getCursoById = async (req, res) => {
    try {
        const curso = await Curso.findById(req.params.id);
        if (!curso) return res.status(404).json({ message: 'Curso não encontrado' });
        res.status(200).json(curso);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar curso', error: error.message });
    }
};

exports.createCurso = async (req, res) => {
    try {
        const dadosCurso = { ...req.body };

        dadosCurso.tags = parseJSONSafe(dadosCurso.tags);
        dadosCurso.contatos = addIds(parseJSONSafe(dadosCurso.contatos));
        dadosCurso.conteudos = addIds(parseJSONSafe(dadosCurso.conteudos));

        dadosCurso.destacado = dadosCurso.destacado === 'true' || dadosCurso.destacado === true;
        dadosCurso.vagas = Number(dadosCurso.vagas) || 0;
        dadosCurso.xp = Number(dadosCurso.xp) || 0;

        if (req.file) dadosCurso.imagem = `uploads/${req.file.filename}`;

        const novoCurso = new Curso(dadosCurso);
        const cursoSalvo = await novoCurso.save();
        res.status(201).json(cursoSalvo);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar curso', error: error.message });
    }
};

exports.updateCurso = async (req, res) => {
    try {
        const { id } = req.params;
        const dadosAtualizados = {};

        // Campos simples
        ['titulo', 'descricao', 'organizacao', 'local', 'status'].forEach(field => {
            if (req.body[field] !== undefined) dadosAtualizados[field] = req.body[field];
        });

        // Datas
if (req.body.dataInicio !== undefined) dadosAtualizados.dataInicio = new Date(req.body.dataInicio);
if (req.body.dataFim !== undefined) dadosAtualizados.dataFim = new Date(req.body.dataFim);


        // Tags, contatos e conteúdos
        if (req.body.tags !== undefined) dadosAtualizados.tags = parseJSONSafe(req.body.tags);
        if (req.body.contatos !== undefined) dadosAtualizados.contatos = addIds(parseJSONSafe(req.body.contatos));
        if (req.body.conteudos !== undefined) dadosAtualizados.conteudos = addIds(parseJSONSafe(req.body.conteudos));

        // Booleanos e numéricos
        if (req.body.destacado !== undefined) dadosAtualizados.destacado = req.body.destacado === 'true' || req.body.destacado === true;
        if (req.body.vagas !== undefined) dadosAtualizados.vagas = Number(req.body.vagas) || 0;
        if (req.body.xp !== undefined) dadosAtualizados.xp = Number(req.body.xp) || 0;

        // Imagem
        if (req.file) {
            const cursoAntigo = await Curso.findById(id);
            if (cursoAntigo?.imagem && fs.existsSync(path.join(__dirname, '../../', cursoAntigo.imagem))) {
                fs.unlinkSync(path.join(__dirname, '../../', cursoAntigo.imagem));
            }
            dadosAtualizados.imagem = `uploads/${req.file.filename}`;
        }

        const cursoAtualizado = await Curso.findByIdAndUpdate(id, dadosAtualizados, { new: true, runValidators: true });
        if (!cursoAtualizado) return res.status(404).json({ message: 'Curso não encontrado' });

        res.status(200).json(cursoAtualizado);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar curso', error: error.message });
    }
};

exports.deleteCurso = async (req, res) => {
    try {
        const curso = await Curso.findById(req.params.id);
        if (!curso) return res.status(404).json({ message: 'Curso não encontrado' });

        if (curso.imagem && fs.existsSync(path.join(__dirname, '../../', curso.imagem))) {
            fs.unlinkSync(path.join(__dirname, '../../', curso.imagem));
        }

        await Curso.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Curso e imagem deletados com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar curso', error: error.message });
    }
};

exports.toggleHighlight = async (req, res) => {
    try {
        const curso = await Curso.findById(req.params.id);
        if (!curso) return res.status(404).json({ message: 'Curso não encontrado' });

        curso.destacado = !curso.destacado;
        await curso.save();

        res.status(200).json(curso);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao alternar destaque', error: error.message });
    }
};



// ------------------------------------------------------------------
// 🔹 INSCRIÇÃO EM CURSO COM GARANTIA DE VAGA
// ------------------------------------------------------------------
exports.inscreverCurso = async (req, res) => {
  try {
    const userId = req.user.id;
    const cursoId = req.params.id;

    // 🔹 Busca o curso
    const curso = await Curso.findById(cursoId);
    if (!curso) {
      return res.status(404).json({
        message: "Curso não encontrado",
        type: "not_found",
      });
    }

    // 🔹 Valida status do curso
    if (curso.status !== "Upcoming") {
      const mensagens = {
        Ongoing: "Inscrições encerradas. O curso já está em andamento.",
        Completed: "Este curso já foi concluído.",
        Cancelled: "Este curso foi cancelado.",
      };

      return res.status(403).json({
        message: mensagens[curso.status] || "Inscrição não permitida para este curso",
        status: curso.status,
        type: "invalid_status",
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
    user.cursosInscritos = user.cursosInscritos || [];
    const jaInscrito = user.cursosInscritos.some(
      (id) => id.toString() === cursoId
    );
    if (jaInscrito) {
      return res.status(200).json({
        message: "Usuário já inscrito neste curso",
        type: "duplicate",
      });
    }

    // 🔹 Atualiza vagas de forma atômica para garantir vaga
    let cursoAtualizado;
    if (curso.vagas !== null) {
      cursoAtualizado = await Curso.findOneAndUpdate(
        { _id: cursoId, vagasOcupadas: { $lt: curso.vagas } }, // só incrementa se ainda houver vaga
        { $inc: { vagasOcupadas: 1 } },
        { new: true }
      );

      if (!cursoAtualizado) {
        // Se não conseguiu incrementar, o curso já está lotado
        return res.status(400).json({
          message: "Curso lotado",
          vagasTotais: curso.vagas,
          vagasOcupadas: curso.vagasOcupadas,
          vagasDisponiveis: 0,
          type: "full",
        });
      }
    } else {
      // Curso ilimitado
      cursoAtualizado = await Curso.findByIdAndUpdate(
        cursoId,
        { $inc: { vagasOcupadas: 1 } },
        { new: true }
      );
    }

    // 🔹 Salva inscrição no usuário
    user.cursosInscritos.push(curso._id);
    await user.save();

    const vagasDisponiveis =
      cursoAtualizado.vagas !== null
        ? cursoAtualizado.vagas - cursoAtualizado.vagasOcupadas
        : "Ilimitadas";

    res.status(200).json({
      message: "Inscrição realizada com sucesso",
      vagasTotais: cursoAtualizado.vagas,
      vagasOcupadas: cursoAtualizado.vagasOcupadas,
      vagasDisponiveis,
      type: "success",
    });

  } catch (error) {
    console.error("Erro na inscrição do curso:", error);
    res.status(500).json({
      message: "Erro ao realizar inscrição",
      type: "server_error",
    });
  }
};


// ------------------------------------------------------------------
// 🔹 CANCELAR INSCRIÇÃO EM CURSO
// ------------------------------------------------------------------
exports.cancelarInscricaoCurso = async (req, res) => {
  try {
    const userId = req.user.id;
    const cursoId = req.params.id;

    // 🔹 Busca curso
    const curso = await Curso.findById(cursoId);
    if (!curso) {
      return res.status(404).json({
        message: "Curso não encontrado",
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
    const index = user.cursosInscritos.findIndex(
      (id) => id.toString() === cursoId
    );

    if (index === -1) {
      return res.status(400).json({
        message: "Usuário não está inscrito neste curso",
        type: "not_subscribed",
      });
    }

    // 🔹 Remove inscrição do usuário
    user.cursosInscritos.splice(index, 1);
    await user.save();

    // 🔹 Atualiza vagas (não deixa negativo)
    if (curso.vagas !== null && curso.vagasOcupadas > 0) {
      await Curso.findByIdAndUpdate(cursoId, {
        $inc: { vagasOcupadas: -1 },
      });
    }

    res.status(200).json({
      message: "Inscrição cancelada com sucesso",
  vagasTotais: curso.vagas,
  vagasOcupadas: curso.vagasOcupadas - 1, // já que você decrementou
  vagasDisponiveis: curso.vagas - (curso.vagasOcupadas - 1),
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
// 🔹 LISTAR CURSOS INSCRITOS DO USUÁRIO
// ------------------------------------------------------------------
exports.listarCursosInscritos = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId)
      .populate({
        path: "cursosInscritos",
        select: "titulo status dataInicio local", // campos essenciais
        options: { sort: { dataInicio: 1 } },   // ordena por data de início
      });

    if (!user) {
      return res.status(404).json({
        message: "Usuário não encontrado",
        type: "not_found",
      });
    }

    const cursos = user.cursosInscritos.map((curso) => ({
      id: curso._id,
      titulo: curso.titulo,
      status: curso.status,
      data: curso.dataInicio,
      local: curso.local,
    }));

    res.status(200).json(cursos);
  } catch (error) {
    console.error("Erro ao listar cursos inscritos:", error);
    res.status(500).json({
      message: "Erro ao listar cursos inscritos",
      type: "server_error",
    });
  }
};
