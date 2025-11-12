const Achievement = require('../models/Achievement');

// Função auxiliar para simular upload de ícone
const simulateIconUpload = (file) => {
    // Em um ambiente real, faria o upload para S3/Cloudinary
    return `https://cdn.hubjuventude.com/icons/${Date.now()}-${file.name || 'default.png'}`;
};

// [POST] /api/achievements - Criar nova conquista (Apenas Admin)
exports.createAchievement = async (req, res) => {
    try {
        const { nome, descricao, categoria, pontuacao, criterioDesbloqueio, visibilidade } = req.body;
        
        // Simulação de upload de ícone (assumindo que o corpo da requisição contenha a informação do ícone)
        const iconeEmblema = simulateIconUpload(req.body.icone || {});

        const newAchievement = new Achievement({
            nome,
            descricao,
            categoria,
            pontuacao,
            criterioDesbloqueio,
            iconeEmblema,
            visibilidade: visibilidade || 'publica'
        });

        await newAchievement.save();

        res.status(201).json({ message: 'Conquista criada com sucesso.', achievement: newAchievement });

    } catch (error) {
        res.status(500).send({ error: 'Erro ao criar conquista.', details: error.message });
    }
};

// [GET] /api/achievements - Listar todas as conquistas (Admin vê todas, Jovem vê públicas)
exports.listAchievements = async (req, res) => {
    try {
        const isAdmin = req.user && req.user.nivelAcesso === 'administrador';
        const query = isAdmin ? {} : { visibilidade: 'publica' };

        const achievements = await Achievement.find(query).sort({ pontuacao: -1 });

        res.status(200).json({ achievements });

    } catch (error) {
        res.status(500).send({ error: 'Erro ao listar conquistas.', details: error.message });
    }
};

// [PUT] /api/achievements/:id - Atualizar conquista (Apenas Admin)
exports.updateAchievement = async (req, res) => {
    try {
        const updatedAchievement = await Achievement.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

        if (!updatedAchievement) {
            return res.status(404).send({ error: 'Conquista não encontrada.' });
        }

        res.status(200).json({ message: 'Conquista atualizada com sucesso.', achievement: updatedAchievement });

    } catch (error) {
        res.status(500).send({ error: 'Erro ao atualizar conquista.', details: error.message });
    }
};

// [DELETE] /api/achievements/:id - Deletar conquista (Apenas Admin)
exports.deleteAchievement = async (req, res) => {
    try {
        const deletedAchievement = await Achievement.findByIdAndDelete(req.params.id);

        if (!deletedAchievement) {
            return res.status(404).send({ error: 'Conquista não encontrada.' });
        }

        // TODO: Implementar a remoção desta conquista dos perfis dos usuários

        res.status(200).json({ message: 'Conquista deletada com sucesso.' });

    } catch (error) {
        res.status(500).send({ error: 'Erro ao deletar conquista.', details: error.message });
    }
};
