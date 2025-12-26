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
        required: function () {
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
    },

    xp: {
        type: Number,
        default: 0
    },
    nivel: {
        type: Number,
        default: 1
    },
    // 🎟️ EVENTOS INSCRITOS
    eventosInscritos: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Evento'
        }
    ],
    cursosInscritos: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Curso'
        }
    ],


    // 🔹 Histórico de check-ins (eventos, cursos, oportunidades)
    historicoCheckins: [
        {
            tipo: {
                type: String,
                enum: ['Evento', 'Curso', 'Oportunidade'], // maiúsculo para casar com o model
                required: true
            },
            refId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                refPath: 'historicoCheckins.tipo' // popula dinamicamente
            },
            checkinEm: {
                type: Date,
                default: Date.now
            },
            xpGanho: {
                type: Number,
                default: 0
            }
        }
    ],



    // 🔔 EVENTOS LEMBRADOS
    eventosLembrados: [
        {
            evento: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Evento',
                required: true
            },
            lembreteEm: {
                type: Date, // quando lembrar (opcional)
                default: null
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ],

    // 🔔 CURSOS LEMBRADOS
    cursosLembrados: [
        {
            curso: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Curso',
                required: true
            },
            lembreteEm: {
                type: Date,
                default: null
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ],

    // 🔔 OPORTUNIDADES LEMBRADAS
    oportunidadesLembradas: [
        {
            oportunidade: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Oportunidade',
                required: true
            },
            lembreteEm: {
                type: Date,
                default: null
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ],



    // collection of unlocked achievements nao funciona ainda
    conquistasDesbloqueadas: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Achievement'
    }]
}, { timestamps: true });



/* 👇👇 AQUI 👇👇 */
function calcularNivel(xp) {
    return Math.floor(Math.sqrt(xp / 100)) + 1;
}


/* 👇👇 DEPOIS VÊM OS MIDDLEWARES 👇👇 */

// 🔹 Middleware do nível automático
UserSchema.pre('save', function (next) {
    if (this.xp < 0) this.xp = 0;
    this.nivel = calcularNivel(this.xp);
    next();
});

// Middleware para criptografar a senha antes de salvar
UserSchema.pre('save', async function (next) {
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
UserSchema.methods.comparePassword = async function (candidatePassword) {
    // O 'select: false' impede que a senha seja carregada, então precisamos forçar o carregamento
    const userWithPassword = await this.model('User').findOne({ _id: this._id }).select('+senha');
    if (!userWithPassword || !userWithPassword.senha) {
        return false;
    }
    return bcrypt.compare(candidatePassword, userWithPassword.senha);
};

const User = mongoose.model('User', UserSchema);

module.exports = User;
