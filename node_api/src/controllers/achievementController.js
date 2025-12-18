const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Achievement = require('../models/Achievement');

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

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

exports.upload = upload;

// -------------------- HELPERS --------------------
const parseJSONSafe = (value) => {
    if (!value) return undefined;

    if (
        Array.isArray(value) &&
        value.length === 1 &&
        typeof value[0] === 'string' &&
        (value[0].startsWith('{') || value[0].startsWith('['))
    ) {
        try { return JSON.parse(value[0]); } catch { return undefined; }
    }

    if (Array.isArray(value) || typeof value === 'object') return value;

    if (typeof value === 'string') {
        try { return JSON.parse(value); } catch { return undefined; }
    }

    return undefined;
};

// -------------------- CRUD --------------------

// [GET] /api/achievements
exports.listAchievements = async (req, res) => {
    try {
        const achievements = await Achievement
            .find()
            .sort({ xp: -1, criadoEm: -1 });

        res.status(200).json(achievements);
    } catch (error) {
        res.status(500).json({
            message: 'Erro ao listar conquistas',
            error: error.message
        });
    }
};


exports.getAchievementById = async (req, res) => {
  try {
    const { id } = req.params;

    const achievement = await Achievement.findById(id);

    if (!achievement) {
      return res.status(404).json({ message: 'Conquista não encontrada' });
    }

    res.json(achievement);
  } catch (error) {
    console.error('Erro ao buscar conquista:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};


// [GET] /api/achievements/:id
exports.getAchievementById = async (req, res) => {
    try {
        const achievement = await Achievement.findById(req.params.id);

        if (!achievement) {
            return res.status(404).json({ message: 'Conquista não encontrada' });
        }

        res.status(200).json(achievement);
    } catch (error) {
        res.status(500).json({
            message: 'Erro ao buscar conquista',
            error: error.message
        });
    }
};

// [POST] /api/achievements
exports.createAchievement = async (req, res) => {
    try {
        const dados = { ...req.body };

        // Tags e critério
        if (dados.tags !== undefined) {
            dados.tags = parseJSONSafe(dados.tags) || [];
        }

        if (dados.criterioDesbloqueio !== undefined) {
            dados.criterioDesbloqueio = parseJSONSafe(dados.criterioDesbloqueio);
        }

        // Boolean / Number
        if (dados.ativa !== undefined) {
            dados.ativa = dados.ativa === 'true' || dados.ativa === true;
        }

        if (dados.xp !== undefined) {
            dados.xp = Number(dados.xp) || 0;
        }

        // Imagem
        if (req.file) {
            dados.imagem = `uploads/${req.file.filename}`;
        }

        const achievement = new Achievement(dados);
        const salvo = await achievement.save();

        res.status(201).json(salvo);
    } catch (error) {
        res.status(500).json({
            message: 'Erro ao criar conquista',
            error: error.message
        });
    }
};

// [PUT] /api/achievements/:id
exports.updateAchievement = async (req, res) => {
    try {
        const { id } = req.params;
        const dadosAtualizados = {};

        // Campos simples
        ['titulo', 'descricao'].forEach(field => {
            if (req.body[field] !== undefined) {
                dadosAtualizados[field] = req.body[field];
            }
        });

        // Tags e critério
        if (req.body.tags !== undefined) {
            dadosAtualizados.tags = parseJSONSafe(req.body.tags) || [];
        }

        if (req.body.criterioDesbloqueio !== undefined) {
            dadosAtualizados.criterioDesbloqueio = parseJSONSafe(req.body.criterioDesbloqueio);
        }

        // Boolean / Number
        if (req.body.ativa !== undefined) {
            dadosAtualizados.ativa = req.body.ativa === 'true' || req.body.ativa === true;
        }

        if (req.body.xp !== undefined) {
            dadosAtualizados.xp = Number(req.body.xp) || 0;
        }

        // Imagem
        if (req.file) {
            const antigo = await Achievement.findById(id);

            if (
                antigo?.imagem &&
                fs.existsSync(path.join(__dirname, '../../', antigo.imagem))
            ) {
                fs.unlinkSync(path.join(__dirname, '../../', antigo.imagem));
            }

            dadosAtualizados.imagem = `uploads/${req.file.filename}`;
        }

        const achievement = await Achievement.findByIdAndUpdate(
            id,
            dadosAtualizados,
            { new: true, runValidators: true }
        );

        if (!achievement) {
            return res.status(404).json({ message: 'Conquista não encontrada' });
        }

        res.status(200).json(achievement);
    } catch (error) {
        res.status(500).json({
            message: 'Erro ao atualizar conquista',
            error: error.message
        });
    }
};

// [DELETE] /api/achievements/:id
exports.deleteAchievement = async (req, res) => {
    try {
        const achievement = await Achievement.findById(req.params.id);

        if (!achievement) {
            return res.status(404).json({ message: 'Conquista não encontrada' });
        }

        if (
            achievement.imagem &&
            fs.existsSync(path.join(__dirname, '../../', achievement.imagem))
        ) {
            fs.unlinkSync(path.join(__dirname, '../../', achievement.imagem));
        }

        await Achievement.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: 'Conquista e imagem deletadas com sucesso'
        });
    } catch (error) {
        res.status(500).json({
            message: 'Erro ao deletar conquista',
            error: error.message
        });
    }
};
