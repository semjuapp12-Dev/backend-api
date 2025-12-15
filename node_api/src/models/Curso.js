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
    organizacao: {
        type: String
    },
    dataInicio: { //formato ISO enviado pelo frontend
        type: Date,
        required: true
    },
    dataFim: { //formato ISO enviado pelo fronten
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
    destacado: {
        type: Boolean,
        default: false
    },
    vagas: {
        type: Number, // Pode ser null se for ilimitado
        default: null
    },
    vagasOcupadas: { // Número de vagas já ocupadas
        type: Number,
        default: 0
    },
    conteudos: [ // lista de conteúdos do evento, cada conteúdo com título e itens
        {
            titulo: { type: String},
            itens: [{ type: String }]
        }
    ],
    contatos: [ // lista de contatos do evento
        {
            telefone: { type: String },
            email: { type: String },
            redeSocial: { type: String }
        }
    ],
    imagem: {
        type: String // URL da imagem ou caminho no servidor
    },

    tags: [{
        type: String
    }],
     likes: {
        type: Number,
        default: 0
    },
    criadoEm: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Curso', CursoSchema);