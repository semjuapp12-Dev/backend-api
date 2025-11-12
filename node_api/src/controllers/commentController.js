const Comment = require('../models/Comment');
const Content = require('../models/Content');

// [POST] /api/comments - Criar novo comentário
exports.createComment = async (req, res) => {
    try {
        const { conteudoId, texto } = req.body;
        const autorId = req.user._id; // ID do usuário autenticado

        // 1. Validação básica
        if (!conteudoId || !texto) {
            return res.status(422).send({ error: 'Campos obrigatórios: conteudoId e texto.' });
        }

        // 2. Verificar se o conteúdo existe
        const content = await Content.findById(conteudoId);
        if (!content) {
            return res.status(404).send({ error: 'Conteúdo não encontrado.' });
        }

        // 3. Criar e salvar o novo comentário
        const newComment = new Comment({
            conteudoId,
            autorId,
            texto
        });

        await newComment.save();

        // 4. Atualizar a contagem de comentários no Content
        await Content.findByIdAndUpdate(conteudoId, { $inc: { comentariosCount: 1 } });

        // 5. Retornar o comentário criado
        res.status(201).json({ message: 'Comentário criado com sucesso.', comment: newComment });

    } catch (error) {
        res.status(500).send({ error: 'Erro ao criar comentário.', details: error.message });
    }
};

// [GET] /api/comments/:contentId - Listar comentários de um conteúdo
exports.listComments = async (req, res) => {
    try {
        const { contentId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const comments = await Comment.find({ conteudoId: contentId })
            .sort({ createdAt: 1 }) // Ordem cronológica
            .limit(parseInt(limit))
            .skip(skip)
            .populate('autorId', 'nomeCompleto fotoPerfil'); // Popula o autor

        const totalComments = await Comment.countDocuments({ conteudoId: contentId });

        res.status(200).json({
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(totalComments / parseInt(limit)),
            totalResults: totalComments,
            comments
        });

    } catch (error) {
        res.status(500).send({ error: 'Erro ao listar comentários.', details: error.message });
    }
};

// [DELETE] /api/comments/:id - Deletar comentário
exports.deleteComment = async (req, res) => {
    try {
        const commentId = req.params.id;
        const userId = req.user._id;
        const nivelAcesso = req.user.nivelAcesso;

        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).send({ error: 'Comentário não encontrado.' });
        }

        // Verifica permissão: Admin/Moderador OU o autor do comentário
        const isAuthorized = (nivelAcesso === 'administrador' || nivelAcesso === 'moderador' || comment.autorId.equals(userId));

        if (!isAuthorized) {
            return res.status(403).send({ error: 'Permissão negada. Você não é o autor nem tem nível de acesso suficiente.' });
        }

        // 1. Deletar o comentário
        await Comment.findByIdAndDelete(commentId);

        // 2. Decrementar a contagem de comentários no Content
        await Content.findByIdAndUpdate(comment.conteudoId, { $inc: { comentariosCount: -1 } });

        res.status(200).json({ message: 'Comentário deletado com sucesso.' });

    } catch (error) {
        res.status(500).send({ error: 'Erro ao deletar comentário.', details: error.message });
    }
};

// [POST] /api/comments/:id/report - Denunciar comentário
exports.reportComment = async (req, res) => {
    try {
        const commentId = req.params.id;
        const userId = req.user._id;

        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).send({ error: 'Comentário não encontrado.' });
        }

        // Verifica se o usuário já denunciou
        if (comment.denuncias.includes(userId)) {
            return res.status(409).send({ error: 'Você já denunciou este comentário.' });
        }

        // Adiciona a denúncia
        comment.denuncias.push(userId);
        await comment.save();

        res.status(200).json({ message: 'Comentário denunciado com sucesso. Ele será revisado por um moderador.' });

    } catch (error) {
        res.status(500).send({ error: 'Erro ao denunciar comentário.', details: error.message });
    }
};

// [GET] /api/comments/moderation - Listar comentários denunciados (Apenas Admin/Moderador)
exports.listReportedComments = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const comments = await Comment.find({ denuncias: { $exists: true, $not: { $size: 0 } }, moderado: false })
            .sort({ 'denuncias.length': -1, createdAt: 1 }) // Mais denunciados primeiro, depois mais antigos
            .limit(parseInt(limit))
            .skip(skip)
            .populate('autorId', 'nomeCompleto fotoPerfil');

        const totalComments = await Comment.countDocuments({ denuncias: { $exists: true, $not: { $size: 0 } }, moderado: false });

        res.status(200).json({
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(totalComments / parseInt(limit)),
            totalResults: totalComments,
            comments
        });

    } catch (error) {
        res.status(500).send({ error: 'Erro ao listar comentários denunciados.', details: error.message });
    }
};

// [PUT] /api/comments/:id/moderate - Marcar comentário como moderado (Apenas Admin/Moderador)
exports.moderateComment = async (req, res) => {
    try {
        const commentId = req.params.id;
        const { action } = req.body; // 'approve' ou 'delete'

        if (action === 'delete') {
            // Reutiliza a lógica de exclusão, que já verifica permissão
            return exports.deleteComment(req, res);
        }

        if (action === 'approve') {
            const comment = await Comment.findByIdAndUpdate(commentId, { moderado: true, denuncias: [] }, { new: true });

            if (!comment) {
                return res.status(404).send({ error: 'Comentário não encontrado.' });
            }

            return res.status(200).json({ message: 'Comentário aprovado e marcado como moderado.', comment });
        }

        res.status(400).send({ error: 'Ação de moderação inválida. Use "approve" ou "delete".' });

    } catch (error) {
        res.status(500).send({ error: 'Erro ao moderar comentário.', details: error.message });
    }
};
