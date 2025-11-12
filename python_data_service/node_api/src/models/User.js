const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    nomeCompleto: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    cpf: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    dataNascimento: {
        type: Date,
        required: true
    },
    senha: {
        type: String,
        required: function() {
            // A senha é obrigatória se não houver login social
            return !this.provedorSocial;
        },
        select: false // Não retorna a senha por padrão nas consultas
    },
    provedorSocial: {
        type: String,
        enum: ['google', 'apple', null],
        default: null
    },
    idProvedorSocial: {
        type: String,
        default: null
    },
    fotoPerfil: {
        type: String,
        default: null
    },
    biografia: {
        type: String,
        default: null
    },
    telefone: {
        type: String,
        default: null
    },
    areasInteresse: {
        type: [String],
        default: []
    },
    nivelAcesso: {
        type: String,
        enum: ['jovem', 'administrador', 'editor', 'moderador'],
        default: 'jovem'
    },
    ativo: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Middleware para criptografar a senha antes de salvar
UserSchema.pre('save', async function(next) {
    // Só executa se a senha foi modificada ou é nova E se não for login social
    if (!this.isModified('senha') || this.provedorSocial) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.senha = await bcrypt.hash(this.senha, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Método para comparar a senha fornecida com a senha criptografada
UserSchema.methods.comparePassword = async function(candidatePassword) {
    // O 'select: false' impede que a senha seja carregada, então precisamos forçar o carregamento
    const userWithPassword = await this.model('User').findOne({ _id: this._id }).select('+senha');
    if (!userWithPassword || !userWithPassword.senha) {
        return false;
    }
    return bcrypt.compare(candidatePassword, userWithPassword.senha);
};

const User = mongoose.model('User', UserSchema);

module.exports = User;
