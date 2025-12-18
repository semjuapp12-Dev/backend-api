// src/controllers/oportunidadeController.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Oportunidade = require('../models/Oportunidade');

// -------------------- MULTER CONFIG --------------------
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads/')),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
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

const addIds = (arr) => arr.map(item => ({ id: Date.now() + Math.random(), ...item }));

// -------------------- CRUD --------------------
exports.listOportunidades = async (req, res) => {
    try {
        const oportunidades = await Oportunidade.find().sort({ criadoEm: -1 });
        res.status(200).json(oportunidades);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar oportunidades', error: error.message });
    }
};

exports.getOportunidadeById = async (req, res) => {
    try {
        const oportunidade = await Oportunidade.findById(req.params.id);
        if (!oportunidade) return res.status(404).json({ message: 'Oportunidade não encontrada' });
        res.status(200).json(oportunidade);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar oportunidade', error: error.message });
    }
};

exports.createOportunidade = async (req, res) => {
    try {
        const dados = { ...req.body };

        dados.conteudos = addIds(parseJSONSafe(dados.conteudos));
        dados.contatos = addIds(parseJSONSafe(dados.contatos));
        dados.destacado = dados.destacado === 'true' || dados.destacado === true;
        dados.vagas = Number(dados.vagas) || 0;

        if (req.file) dados.imagem = `uploads/${req.file.filename}`;

        const novaOportunidade = new Oportunidade(dados);
        const salva = await novaOportunidade.save();
        res.status(201).json(salva);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar oportunidade', error: error.message });
    }
};

exports.updateOportunidade = async (req, res) => {
    try {
        const { id } = req.params;
        const dadosAtualizados = {};

        // Campos simples
        ['titulo', 'descricao', 'organizador', 'empresa', 'cargo', 'local', 'status', 'salario', 'horaTrabalho', 'sobreEmpresa', 'dataInicio', 'dataFim'].forEach(field => {
            if (req.body[field] !== undefined) dadosAtualizados[field] = req.body[field];
        });




        if (req.body.dataInicio !== undefined) dadosAtualizados.dataInicio = new Date(req.body.dataInicio);
        if (req.body.dataFim !== undefined) dadosAtualizados.dataFim = new Date(req.body.dataFim);

        
        // Conteudos e contatos
        if (req.body.conteudos !== undefined) dadosAtualizados.conteudos = addIds(parseJSONSafe(req.body.conteudos));
        if (req.body.contatos !== undefined) dadosAtualizados.contatos = addIds(parseJSONSafe(req.body.contatos));

        // Booleanos e numéricos
        if (req.body.destacado !== undefined) dadosAtualizados.destacado = req.body.destacado === 'true' || req.body.destacado === true;
        if (req.body.vagas !== undefined) dadosAtualizados.vagas = Number(req.body.vagas) || 0;

        // Imagem
        if (req.file) {
            const antiga = await Oportunidade.findById(id);
            if (antiga?.imagem && fs.existsSync(path.join(__dirname, '../../', antiga.imagem))) {
                fs.unlinkSync(path.join(__dirname, '../../', antiga.imagem));
            }
            dadosAtualizados.imagem = `uploads/${req.file.filename}`;
        }

        const atualizada = await Oportunidade.findByIdAndUpdate(id, dadosAtualizados, { new: true, runValidators: true });
        if (!atualizada) return res.status(404).json({ message: 'Oportunidade não encontrada' });

        res.status(200).json(atualizada);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar oportunidade', error: error.message });
    }
};

exports.deleteOportunidade = async (req, res) => {
    try {
        const oportunidade = await Oportunidade.findById(req.params.id);
        if (!oportunidade) return res.status(404).json({ message: 'Oportunidade não encontrada' });

        if (oportunidade.imagem && fs.existsSync(path.join(__dirname, '../../', oportunidade.imagem))) {
            fs.unlinkSync(path.join(__dirname, '../../', oportunidade.imagem));
        }

        await Oportunidade.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Oportunidade e imagem deletadas com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar oportunidade', error: error.message });
    }
};

exports.toggleHighlight = async (req, res) => {
    try {
        const oportunidade = await Oportunidade.findById(req.params.id);
        if (!oportunidade) return res.status(404).json({ message: 'Oportunidade não encontrada' });

        oportunidade.destacado = !oportunidade.destacado;
        await oportunidade.save();
        res.status(200).json(oportunidade);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao alternar destaque', error: error.message });
    }
};
