// src/controllers/eventoController.js

// 1. Importar o modelo real (Isso é obrigatório)
const Evento = require('../models/Evento'); 

// Função para listar todos os eventos
exports.listEventos = async (req, res) => {
    try {
        // Lógica REAL: Busca todos os eventos no banco e ordena por data
        const eventos = await Evento.find().sort({ data: 1 });
        
        res.status(200).json(eventos);
    } catch (error) {
        console.error("Erro ao listar eventos:", error);
        res.status(500).json({ message: 'Erro ao buscar eventos', error: error.message });
    }
};

// Função para obter um evento por ID
exports.getEventoById = async (req, res) => {
    try {
        const { id } = req.params;
        const evento = await Evento.findById(id);

        if (!evento) {
            return res.status(404).json({ message: 'Evento não encontrado' });
        }

        res.status(200).json(evento);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar evento', error: error.message });
    }
};

// Função para criar um novo evento
exports.createEvento = async (req, res) => {
    try {
        // 2. Cria uma nova instância do Model com os dados que vieram do Frontend
        const novoEvento = new Evento(req.body);

        // 3. Salva no banco de dados de verdade
        const eventoSalvo = await novoEvento.save();

        // Retorna o objeto criado (agora com _id gerado pelo Mongo)
        res.status(201).json(eventoSalvo);

    } catch (error) {
        console.error("Erro no controller createEvento:", error);
        res.status(500).json({ message: 'Erro ao criar evento', error: error.message });
    }
};

// Função para atualizar um evento
exports.updateEvento = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Busca pelo ID e atualiza com o req.body
        // { new: true } faz retornar o objeto já atualizado
        const eventoAtualizado = await Evento.findByIdAndUpdate(id, req.body, { new: true });

        if (!eventoAtualizado) {
            return res.status(404).json({ message: 'Evento não encontrado para atualização' });
        }

        res.status(200).json(eventoAtualizado);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar evento', error: error.message });
    }
};

// Função para deletar um evento
exports.deleteEvento = async (req, res) => {
    try {
        const { id } = req.params;
        
        const eventoDeletado = await Evento.findByIdAndDelete(id);

        if (!eventoDeletado) {
            return res.status(404).json({ message: 'Evento não encontrado para exclusão' });
        }

        res.status(200).json({ message: 'Evento deletado com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar evento', error: error.message });
    }
};