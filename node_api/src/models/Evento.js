const mongoose = require('mongoose');

const EventoSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: true
    },
    descricao: {
        type: String
    },
    organizador: {
        type: String
    },
    // O frontend envia data em formato ISO, o Mongoose converte para Date automaticamente
    data: {
        type: Date,
        required: true
    },
    hora: {
        type: String
    },
    local: {
        type: String
    },
    status: {
        type: String,
        default: 'Upcoming' // Valor padrão se não for enviado
    },
    highlighted: {
        type: Boolean,
        default: false
    },
    acesso: {
        type: String,
        enum: ['Público', 'Privado'],
        default: 'Público'
    },
    vagas: {
        type: Number, // Pode ser null se for ilimitado
        default: null
    },
    imagem: {
        type: String // URL da imagem ou base64
    },
    tags: [{
        type: String
    }],
    criadoEm: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Evento', EventoSchema);