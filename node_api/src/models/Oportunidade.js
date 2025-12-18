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
    status: {
        type: String,
        default: 'Upcoming' // Valor padrão se não for enviado
    },
    salario: {
        type: String
    },
    horaTrabalho: {
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
    conteudos: [ // lista de conteúdos do oportunidades, cada conteúdo com título e itens
        {
            titulo: { type: String},
            itens: [{ type: String }]
        }
    ],
    contatos: [ // lista de contatos de oportunidades
        {
            telefone: { type: String },
            email: { type: String },
            redeSocial: { type: String }
        }
    ],
    imagem: {
        type: String // URL da imagem ou caminho no servidor
    },
    
    vagas: {
        type: Number, 
        default: null
    },
    sobreEmpresa: {
        type: String
    },
     likes: {
        type: Number,
        default: 0
    },
    criadoEm: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Oportunidade', OportunidadeSchema);