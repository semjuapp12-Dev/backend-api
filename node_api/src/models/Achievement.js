const mongoose = require('mongoose');

const AchievementSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true,
        trim: true
    },
    descricao: {
        type: String,
        required: true
    },
    categoria: {
        type: String,
        required: true,
        trim: true
    },
    pontuacao: {
        type: Number,
        required: true,
        min: 0
    },
    criterioDesbloqueio: {
        type: String,
        required: true,
        // Ex: "participar de 3 eventos", "curtir 10 posts"
    },
    iconeEmblema: {
        type: String, // URL do ícone/emblema
        required: true
    },
    visibilidade: {
        type: String,
        enum: ['publica', 'oculta'],
        default: 'publica'
    },
    dataCriacao: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const Achievement = mongoose.model('Achievement', AchievementSchema);

module.exports = Achievement;
