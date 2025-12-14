// src/controllers/cursoController.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Curso = require('../models/Curso');

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
