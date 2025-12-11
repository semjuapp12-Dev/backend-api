const Oportunidade = require('../models/Oportunidade');

// ---------------- LISTAR TODAS ---------------- //
exports.listOportunidades = async (req, res) => {
    try {
        const oportunidades = await Oportunidade.find().sort({ criadoEm: -1 });
        res.status(200).json(oportunidades);
    } catch (error) {
        console.error("Erro ao listar oportunidades:", error);
        res.status(500).json({ message: 'Erro ao buscar oportunidades', error: error.message });
    }
};

// ---------------- OBTER POR ID ---------------- //
exports.getOportunidadeById = async (req, res) => {
    try {
        const { id } = req.params;
        const oportunidade = await Oportunidade.findById(id);

        if (!oportunidade) {
            return res.status(404).json({ message: 'Oportunidade não encontrada' });
        }

        res.status(200).json(oportunidade);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar oportunidade', error: error.message });
    }
};

// ---------------- CRIAR ---------------- //
exports.createOportunidade = async (req, res) => {
    try {
        let dados = { ...req.body };

        // Parse de campos enviados como string
        if (dados.conteudos && typeof dados.conteudos === 'string') {
            dados.conteudos = JSON.parse(dados.conteudos);
        }
        if (dados.contatos && typeof dados.contatos === 'string') {
            dados.contatos = JSON.parse(dados.contatos);
        }

        const novaOportunidade = new Oportunidade(dados);
        const salva = await novaOportunidade.save();

        res.status(201).json(salva);
    } catch (error) {
        console.error("Erro ao criar oportunidade:", error);
        res.status(500).json({ message: 'Erro ao criar oportunidade', error: error.message });
    }
};

// ---------------- ATUALIZAR ---------------- //
exports.updateOportunidade = async (req, res) => {
    try {
        const { id } = req.params;
        let dadosAtualizados = { ...req.body };

        // Parse de arrays JSON, se vierem como string
        if (dadosAtualizados.conteudos && typeof dadosAtualizados.conteudos === 'string') {
            dadosAtualizados.conteudos = JSON.parse(dadosAtualizados.conteudos);
        }
        if (dadosAtualizados.contatos && typeof dadosAtualizados.contatos === 'string') {
            dadosAtualizados.contatos = JSON.parse(dadosAtualizados.contatos);
        }

        const oportunidadeAtualizada = await Oportunidade.findByIdAndUpdate(
            id,
            dadosAtualizados,
            { new: true }
        );

        if (!oportunidadeAtualizada) {
            return res.status(404).json({ message: 'Oportunidade não encontrada para atualização' });
        }

        res.status(200).json(oportunidadeAtualizada);
    } catch (error) {
        console.error("Erro ao atualizar oportunidade:", error);
        res.status(500).json({ message: 'Erro ao atualizar oportunidade', error: error.message });
    }
};

// ---------------- DELETAR ---------------- //
exports.deleteOportunidade = async (req, res) => {
    try {
        const { id } = req.params;

        const oportunidadeDeletada = await Oportunidade.findByIdAndDelete(id);

        if (!oportunidadeDeletada) {
            return res.status(404).json({ message: 'Oportunidade não encontrada para exclusão' });
        }

        res.status(200).json({ message: 'Oportunidade deletada com sucesso' });
    } catch (error) {
        console.error("Erro ao deletar oportunidade:", error);
        res.status(500).json({ message: 'Erro ao deletar oportunidade', error: error.message });
    }
};

// ---------------- TOGGLE DESTAQUE ---------------- //
exports.toggleHighlight = async (req, res) => {
    try {
        const { id } = req.params;

        const oportunidade = await Oportunidade.findById(id);

        if (!oportunidade) {
            return res.status(404).json({ message: 'Oportunidade não encontrada' });
        }

        oportunidade.destacado = !oportunidade.destacado;
        await oportunidade.save();

        res.status(200).json(oportunidade);
    } catch (error) {
        console.error("Erro ao alternar destaque:", error);
        res.status(500).json({ message: 'Erro ao alternar destaque', error: error.message });
    }
};
