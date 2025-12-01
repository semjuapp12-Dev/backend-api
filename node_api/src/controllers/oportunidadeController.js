const Oportunidade = require('../models/Oportunidade');

// Função para listar todas as oportunidades
exports.listOportunidades = async (req, res) => {
    try {
        // Busca todas as oportunidades e ordena pelas mais recentes (criadoEm decrescente)
        const oportunidades = await Oportunidade.find().sort({ criadoEm: -1 });
        
        res.status(200).json(oportunidades);
    } catch (error) {
        console.error("Erro ao listar oportunidades:", error);
        res.status(500).json({ message: 'Erro ao buscar oportunidades', error: error.message });
    }
};

// Função para obter uma oportunidade por ID
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

// Função para criar uma nova oportunidade
exports.createOportunidade = async (req, res) => {
    try {
        // Cria a instância do modelo com os dados do corpo da requisição
        const novaOportunidade = new Oportunidade(req.body);
        
        // Salva no banco de dados
        const oportunidadeSalva = await novaOportunidade.save();
        
        res.status(201).json(oportunidadeSalva);
    } catch (error) {
        console.error("Erro ao criar oportunidade:", error);
        res.status(500).json({ message: 'Erro ao criar oportunidade', error: error.message });
    }
};

// Função para atualizar uma oportunidade
exports.updateOportunidade = async (req, res) => {
    try {
        const { id } = req.params;

        // Encontra pelo ID e atualiza. { new: true } retorna o objeto atualizado.
        const oportunidadeAtualizada = await Oportunidade.findByIdAndUpdate(id, req.body, { new: true });

        if (!oportunidadeAtualizada) {
            return res.status(404).json({ message: 'Oportunidade não encontrada para atualização' });
        }

        res.status(200).json(oportunidadeAtualizada);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar oportunidade', error: error.message });
    }
};

// Função para deletar uma oportunidade
exports.deleteOportunidade = async (req, res) => {
    try {
        const { id } = req.params;
        
        const oportunidadeDeletada = await Oportunidade.findByIdAndDelete(id);

        if (!oportunidadeDeletada) {
            return res.status(404).json({ message: 'Oportunidade não encontrada para exclusão' });
        }

        res.status(200).json({ message: 'Oportunidade deletada com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar oportunidade', error: error.message });
    }
};