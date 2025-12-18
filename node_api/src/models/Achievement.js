const mongoose = require('mongoose');

const AchievementSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: true,
        trim: true
    },
    descricao: {
        type: String,
        required: true
    },
    tags: [{
        type: String
    }],
    xp: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    ativa: {
        type: Boolean,
        default: false
    },
    imagem: {
        type: String
    },
    criterioDesbloqueio: {
        tipo: {
            type: String,
            enum: ['EVENTO', 'CURSO', 'OPORTUNIDADE'],
            required: true
        },
        acao: {
            type: String,
            enum: ['PARTICIPAR', 'CONCLUIR', 'INSCRICAO'],
            required: true
        },
        quantidade: {
            type: Number,
            required: true,
            min: 1
        }
    },
    criadoEm: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Achievement', AchievementSchema);
