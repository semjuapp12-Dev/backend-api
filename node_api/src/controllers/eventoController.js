// src/controllers/eventoController.js
// importacoes para tratamento da imagem

const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Adicionado para remover arquivos físicos
// 1. Importar o modelo real (Isso é obrigatório)
const Evento = require('../models/Evento'); 

// Configuração do storage: salva imagens na pasta 'uploads/'
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../uploads/')); // Caminho absoluto para a pasta uploads/
    },
    filename: (req, file, cb) => {
        // Nome único: timestamp + extensão
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// Filtro opcional: aceita apenas imagens
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Apenas imagens são permitidas'), false);
    }
};

// Middleware de upload: aceita um arquivo chamado 'imagem'
const upload = multer({ 
    storage, 
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // Limite: 5MB
});

// Exporte o upload para usar no routes (evita duplicação)
exports.upload = upload;

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
        const dadosEvento = { ...req.body };
        
        // Parse campos que são arrays de objetos (enviados como strings no form-data)
        if (dadosEvento.conteudos && typeof dadosEvento.conteudos === 'string') {
            dadosEvento.conteudos = JSON.parse(dadosEvento.conteudos);
        }
        if (dadosEvento.contatos && typeof dadosEvento.contatos === 'string') {
            dadosEvento.contatos = JSON.parse(dadosEvento.contatos);
        }
        
        // Se imagem foi enviada, salva o caminho relativo
        if (req.file) {
            dadosEvento.imagem = `uploads/${req.file.filename}`; // Ex.: 'uploads/1733875200000.jpg'
        }
        
        const novoEvento = new Evento(dadosEvento);
        const eventoSalvo = await novoEvento.save();
        
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
        const dadosAtualizados = { ...req.body };
        
        // Parse campos que são arrays de objetos
        if (dadosAtualizados.conteudos && typeof dadosAtualizados.conteudos === 'string') {
            dadosAtualizados.conteudos = JSON.parse(dadosAtualizados.conteudos);
        }
        if (dadosAtualizados.contatos && typeof dadosAtualizados.contatos === 'string') {
            dadosAtualizados.contatos = JSON.parse(dadosAtualizados.contatos);
        }
        
        // Se nova imagem enviada, atualiza o caminho
        if (req.file) {
            dadosAtualizados.imagem = `uploads/${req.file.filename}`;
        }
        
        const eventoAtualizado = await Evento.findByIdAndUpdate(id, dadosAtualizados, { new: true });

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
        
        const evento = await Evento.findById(id);
        if (!evento) {
            return res.status(404).json({ message: 'Evento não encontrado para exclusão' });
        }
        
        // Remove o arquivo de imagem se existir
        if (evento.imagem && fs.existsSync(path.join(__dirname, '../../', evento.imagem))) {
            fs.unlinkSync(path.join(__dirname, '../../', evento.imagem));
        }
        
        await Evento.findByIdAndDelete(id);
        
        res.status(200).json({ message: 'Evento e imagem deletados com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar evento', error: error.message });
    }
};