const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    conteudoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Content',
        required: true
    },
    autorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    texto: {
        type: String,
        required: true,
        trim: true
    },
    denuncias: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    moderado: {
        type: Boolean,
        default: false // Falso significa que ainda não foi revisado ou está pendente
    }
}, { timestamps: true });

// Adiciona um índice para otimizar a busca por conteúdo
CommentSchema.index({ conteudoId: 1 });

const Comment = mongoose.model('Comment', CommentSchema);

module.exports = Comment;
