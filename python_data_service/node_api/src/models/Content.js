const mongoose = require('mongoose');

const ContentSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: true,
        trim: true
    },
    corpo: {
        type: String,
        required: true
    },
    tipo: {
        type: String,
        enum: ['noticia', 'evento', 'vaga'],
        required: true
    },
    categoria: {
        type: String,
        required: true,
        trim: true
    },
    imagens: {
        type: [String], // Array de URLs de imagens
        default: []
    },
    videoUrl: {
        type: String,
        default: null
    },
    linkExterno: {
        type: String,
        default: null
    },
    destaque: {
        type: Boolean,
        default: false
    },
    autor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    curtidas: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    // Comentários serão armazenados em uma coleção separada, mas referenciados aqui
    // para facilitar a contagem e a consulta.
    comentariosCount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

// Adiciona um índice para otimizar a busca por categoria e tipo
ContentSchema.index({ categoria: 1, tipo: 1 });

const Content = mongoose.model('Content', ContentSchema);

module.exports = Content;
