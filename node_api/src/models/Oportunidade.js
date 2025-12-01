const mongoose = require('mongoose');

const OportunidadeSchema = new mongoose.Schema({
    cargo: {
        type: String,
        required: true
    },
    empresa: {
        type: String,
        required: true
    },
    descricao: {
        type: String
    },
    // Array de strings para os requisitos
    requisitos: [{
        type: String
    }],
    localizacao: {
        type: String
    },
    horario: {
        type: String
    },
    salario: {
        type: String
    },
    dataInicio: {
        type: Date
    },
    prazo: {
        type: Date
    },
    // Dados de contato aninhados ou planos (no seu front estão planos, mantive planos aqui)
    contatoNome: {
        type: String
    },
    contatoFuncao: {
        type: String
    },
    contatoEmail: {
        type: String
    },
    contatoTelefone: {
        type: String
    },
    status: {
        type: String,
        enum: ['Aberta', 'Fechada', 'Pendente'],
        default: 'Aberta'
    },
    criadoEm: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Oportunidade', OportunidadeSchema);