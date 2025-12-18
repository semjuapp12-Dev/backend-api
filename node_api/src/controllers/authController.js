const jwt = require('jsonwebtoken');
const User = require('../models/User');
const dotenv = require('dotenv');
const passport = require('passport'); // Adicionado para suportar a nova função de login

dotenv.config();

// Função auxiliar para gerar o token JWT (Ainda usada no registro)
const createToken = (user) => {
    return jwt.sign({ sub: user._id, nivelAcesso: user.nivelAcesso }, process.env.JWT_SECRET, {
        expiresIn: '7d'
    });
};

// [POST] /api/auth/register
exports.register = async (req, res) => {
    const { nomeCompleto, email, cpf, dataNascimento, senha } = req.body;

    // 1. Validação básica
    if (!email || !senha || !nomeCompleto || !cpf || !dataNascimento) {
        return res.status(422).send({ error: 'Você deve fornecer nome, e-mail, CPF, data de nascimento e senha.' });
    }

    try {
        // 2. Verificar se o usuário já existe
        const existingUser = await User.findOne({ $or: [{ email }, { cpf }] });

        if (existingUser) {
            return res.status(422).send({ error: 'E-mail ou CPF já cadastrados.' });
        }

        // 3. Criar e salvar o novo usuário
        const user = new User({
            nomeCompleto,
            email,
            cpf,
            dataNascimento,
            senha // A criptografia é feita no hook pre-save do modelo User
        });

        await user.save();

        // 4. Responder com o token
        res.status(201).json({ token: createToken(user), user: { id: user._id, email: user.email, nivelAcesso: user.nivelAcesso } });

    } catch (error) {
        // 5. Tratamento de erro
        res.status(500).send({ error: 'Erro ao registrar usuário.', details: error.message });
    }
};

// [POST] /api/auth/login
// Lógica alterada para usar Passport.js
exports.login = (req, res, next) => {
    passport.authenticate('local', { session: false }, (err, user, info) => {
        if (err || !user) {
            return res.status(400).json({
                message: info ? info.message : 'Falha na autenticação.',
                user: user
            });
        }

        req.login(user, { session: false }, (err) => {
            if (err) {
                res.send(err);
            }

            // Gera o token JWT
            // Nota: O payload aqui usa 'id', enquanto o createToken lá em cima usa 'sub'. 
            // Verifique se o seu middleware de autenticação (requireAuth) espera 'id' ou 'sub'.
            const token = jwt.sign({ id: user._id, nivelAcesso: user.nivelAcesso }, process.env.JWT_SECRET, { expiresIn: '1h' });

            return res.json({ user, token });
        });
    })(req, res, next);
};

// [GET] /api/auth/me (Rota protegida de exemplo)
exports.me = (req, res) => {
    // req.user é populado pelo middleware requireAuth
    res.status(200).json({
        message: 'Dados do usuário autenticado',
        user: {
            id: req.user._id,
            nomeCompleto: req.user.nomeCompleto,
            email: req.user.email,
            nivelAcesso: req.user.nivelAcesso,
            areasInteresse: req.user.areasInteresse
        }
    });
};