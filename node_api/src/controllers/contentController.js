const Content = require('../models/Content');
const User = require('../models/User'); // Necessário para verificar o autor

// Função auxiliar para simular o upload de imagem e retornar uma URL
const simulateImageUpload = (file) => {
    // Em um ambiente real, você usaria uma biblioteca como 'multer' e faria o upload para S3, Cloudinary, etc.
    // Aqui, apenas retornamos uma URL de placeholder.
    return `https://cdn.hubjuventude.com/images/${Date.now()}-${file.name}`;
};

// [POST] /api/content - Criar novo conteúdo (Apenas Admin/Editor)
exports.createContent = async (req, res) => {
    try {
        // req.user é populado pelo requireAuth
        const { nivelAcesso } = req.user;

        if (nivelAcesso !== 'administrador' && nivelAcesso !== 'editor') {
            return res.status(403).send({ error: 'Permissão negada. Apenas administradores e editores podem criar conteúdo.' });
        }

        const { titulo, corpo, tipo, categoria, imagens, videoUrl, linkExterno, destaque } = req.body;

        // Validação básica
        if (!titulo || !corpo || !tipo || !categoria) {
            return res.status(422).send({ error: 'Campos obrigatórios: título, corpo, tipo e categoria.' });
        }

        // Simulação de upload de imagens (se houver)
        const imageUrls = imagens ? imagens.map(simulateImageUpload) : [];

        const newContent = new Content({
            titulo,
            corpo,
            tipo,
            categoria,
            imagens: imageUrls,
            videoUrl,
            linkExterno,
            destaque: destaque || false,
            autor: req.user._id // ID do usuário autenticado
        });

        await newContent.save();

        res.status(201).json({ message: 'Conteúdo criado com sucesso.', content: newContent });

    } catch (error) {
        res.status(500).send({ error: 'Erro ao criar conteúdo.', details: error.message });
    }
};

// [GET] /api/content - Listar todos os conteúdos (Feed)
exports.listContent = async (req, res) => {
    try {
        // Implementação de filtros e paginação (lazy loading)
        const { page = 1, limit = 10, categoria, tipo, search } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const query = {};

        if (categoria) {
            query.categoria = categoria;
        }
        if (tipo) {
            query.tipo = tipo;
        }
        if (search) {
            // Busca por título ou corpo (simples)
            query.$or = [
                { titulo: { $regex: search, $options: 'i' } },
                { corpo: { $regex: search, $options: 'i' } }
            ];
        }

        const contents = await Content.find(query)
            .sort({ destaque: -1, createdAt: -1 }) // Destaques primeiro, depois cronológico
            .limit(parseInt(limit))
            .skip(skip)
            .populate('autor', 'nomeCompleto fotoPerfil'); // Popula o autor com nome e foto

        const totalContents = await Content.countDocuments(query);

        res.status(200).json({
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(totalContents / parseInt(limit)),
            totalResults: totalContents,
            contents
        });

    } catch (error) {
        res.status(500).send({ error: 'Erro ao listar conteúdo.', details: error.message });
    }
};

// [GET] /api/content/:id - Obter conteúdo por ID
exports.getContentById = async (req, res) => {
    try {
        const content = await Content.findById(req.params.id)
            .populate('autor', 'nomeCompleto fotoPerfil');

        if (!content) {
            return res.status(404).send({ error: 'Conteúdo não encontrado.' });
        }

        res.status(200).json({ content });

    } catch (error) {
        res.status(500).send({ error: 'Erro ao buscar conteúdo.', details: error.message });
    }
};

// [PUT] /api/content/:id - Atualizar conteúdo (Apenas Admin/Editor ou Autor)
exports.updateContent = async (req, res) => {
    try {
        const content = await Content.findById(req.params.id);

        if (!content) {
            return res.status(404).send({ error: 'Conteúdo não encontrado.' });
        }

        const { nivelAcesso, _id: userId } = req.user;

        // Verifica permissão: Admin/Editor OU o autor do conteúdo
        const isAuthorized = (nivelAcesso === 'administrador' || nivelAcesso === 'editor' || content.autor.equals(userId));

        if (!isAuthorized) {
            return res.status(403).send({ error: 'Permissão negada. Você não é o autor nem tem nível de acesso suficiente.' });
        }

        // Atualiza os campos permitidos
        const updatedContent = await Content.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

        res.status(200).json({ message: 'Conteúdo atualizado com sucesso.', content: updatedContent });

    } catch (error) {
        res.status(500).send({ error: 'Erro ao atualizar conteúdo.', details: error.message });
    }
};

// [DELETE] /api/content/:id - Deletar conteúdo (Apenas Admin/Editor ou Autor)
exports.deleteContent = async (req, res) => {
    try {
        const content = await Content.findById(req.params.id);

        if (!content) {
            return res.status(404).send({ error: 'Conteúdo não encontrado.' });
        }

        const { nivelAcesso, _id: userId } = req.user;

        // Verifica permissão: Admin/Editor OU o autor do conteúdo
        const isAuthorized = (nivelAcesso === 'administrador' || nivelAcesso === 'editor' || content.autor.equals(userId));

        if (!isAuthorized) {
            return res.status(403).send({ error: 'Permissão negada. Você não é o autor nem tem nível de acesso suficiente.' });
        }

        await Content.findByIdAndDelete(req.params.id);

        // TODO: Implementar a exclusão de comentários relacionados

        res.status(200).json({ message: 'Conteúdo deletado com sucesso.' });

    } catch (error) {
        res.status(500).send({ error: 'Erro ao deletar conteúdo.', details: error.message });
    }
};

// [POST] /api/content/:id/like - Adicionar/Remover curtida
exports.toggleLike = async (req, res) => {
    try {
        const contentId = req.params.id;
        const userId = req.user._id;

        const content = await Content.findById(contentId);

        if (!content) {
            return res.status(404).send({ error: 'Conteúdo não encontrado.' });
        }

        const isLiked = content.curtidas.includes(userId);

        if (isLiked) {
            // Se já curtiu, remove a curtida (unlike)
            content.curtidas.pull(userId);
            await content.save();
            res.status(200).json({ message: 'Curtida removida com sucesso.', liked: false, curtidasCount: content.curtidas.length });
        } else {
            // Se não curtiu, adiciona a curtida (like)
            content.curtidas.push(userId);
            await content.save();
            res.status(200).json({ message: 'Conteúdo curtido com sucesso.', liked: true, curtidasCount: content.curtidas.length });
        }

    } catch (error) {
        res.status(500).send({ error: 'Erro ao processar curtida.', details: error.message });
    }
};

exports.deleteContent = async (req, res) => {
    try {
        const content = await Content.findById(req.params.id);

        if (!content) {
            return res.status(404).send({ error: 'Conteúdo não encontrado.' });
        }

        const { nivelAcesso, _id: userId } = req.user;

        // Verifica permissão: Admin/Editor OU o autor do conteúdo
        const isAuthorized = (nivelAcesso === 'administrador' || nivelAcesso === 'editor' || content.autor.equals(userId));

        if (!isAuthorized) {
            return res.status(403).send({ error: 'Permissão negada. Você não é o autor nem tem nível de acesso suficiente.' });
        }

        await Content.findByIdAndDelete(req.params.id);

        // TODO: Implementar a exclusão de comentários relacionados

        res.status(200).json({ message: 'Conteúdo deletado com sucesso.' });

    } catch (error) {
        res.status(500).send({ error: 'Erro ao deletar conteúdo.', details: error.message });
    }
};
