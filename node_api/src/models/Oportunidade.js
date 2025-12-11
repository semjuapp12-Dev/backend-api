const mongoose = require('mongoose');

const OportunidadeSchema = new mongoose.Schema({
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
    empresa: {
        type: String,
        required: true
    },
    cargo: {
        type: String,
        required: true
    },
    local: {
        type: String
    },
    salario: {
        type: String
    },
    horaTabalho: {
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
    destacado: {
        type: Boolean,
        default: false
    },
    conteudos: [ // lista de conteúdos do evento, cada conteúdo com título e itens
        {
            titulo: { type: String, required: true },
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
    status: {
        type: String,
        default: 'Upcoming' // Valor padrão se não for enviado
    },
    vagas: {
        type: Number, // Pode ser null se for ilimitado
        default: null
    },
    sobreEmpresa: {
        type: String
    },
    criadoEm: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Oportunidade', OportunidadeSchema);