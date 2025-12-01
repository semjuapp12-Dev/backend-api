const mongoose = require('mongoose');

const CursoSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: true
    },
    descricao: {
        type: String,
        required: true
    },
    vagasTotais: {
        type: Number,
        default: 0
    },
    data: {
        type: Date,
        required: true
    },
    horaInicio: {
        type: String
    },
    horaFim: {
        type: String
    },
    local: {
        type: String
    },
    organizacao: {
        type: String
    },
    tags: [{
        type: String
    }],
    requisitos: [{
        type: String
    }],
    destacado: {
        type: Boolean,
        default: false
    },
    mediaName: {
        type: String // Armazena o nome do arquivo ou URL
    },
    mediaType: {
        type: String // 'image' ou 'video'
    },
    status: {
        type: String,
        default: 'Ativo'
    },
    criadoEm: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Curso', CursoSchema);