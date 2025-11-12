const User = require('../models/User');

// [GET] /api/users - Listar todos os usuários (Apenas Admin)
exports.listUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, nivelAcesso } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const query = {};

        if (search) {
            // Busca por nome ou email
            query.$or = [
                { nomeCompleto: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        if (nivelAcesso) {
            query.nivelAcesso = nivelAcesso;
        }

        const users = await User.find(query)
            .select('-senha') // Garante que a senha não seja enviada
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip);

        const totalUsers = await User.countDocuments(query);

        res.status(200).json({
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(totalUsers / parseInt(limit)),
            totalResults: totalUsers,
            users
        });

    } catch (error) {
        res.status(500).send({ error: 'Erro ao listar usuários.', details: error.message });
    }
};

// [GET] /api/users/:id - Obter usuário por ID (Apenas Admin)
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-senha');

        if (!user) {
            return res.status(404).send({ error: 'Usuário não encontrado.' });
        }

        res.status(200).json({ user });

    } catch (error) {
        res.status(500).send({ error: 'Erro ao buscar usuário.', details: error.message });
    }
};

// [PUT] /api/users/:id - Atualizar usuário (Apenas Admin)
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Impede que a senha seja alterada por esta rota (deve ser feita por uma rota de redefinição)
        if (updates.senha) {
            delete updates.senha;
        }

        const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).select('-senha');

        if (!updatedUser) {
            return res.status(404).send({ error: 'Usuário não encontrado.' });
        }

        res.status(200).json({ message: 'Usuário atualizado com sucesso.', user: updatedUser });

    } catch (error) {
        res.status(500).send({ error: 'Erro ao atualizar usuário.', details: error.message });
    }
};

// [DELETE] /api/users/:id - Deletar usuário (Apenas Admin)
exports.deleteUser = async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);

        if (!deletedUser) {
            return res.status(404).send({ error: 'Usuário não encontrado.' });
        }

        // TODO: Implementar a exclusão de conteúdos e comentários relacionados

        res.status(200).json({ message: 'Usuário deletado com sucesso.' });

    } catch (error) {
        res.status(500).send({ error: 'Erro ao deletar usuário.', details: error.message });
    }
};
