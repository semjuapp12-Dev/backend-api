const jwt = require('jsonwebtoken');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();

// Função auxiliar para gerar o token JWT
const createToken = (user) => {
    return jwt.sign({ sub: user._id, nivelAcesso: user.nivelAcesso }, process.env.JWT_SECRET, {
        expiresIn: '7d' // Token expira em 7 dias
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
exports.login = async (req, res) => {
    const { email, senha } = req.body;

    // 1. Validação básica
    if (!email || !senha) {
        return res.status(422).send({ error: 'Você deve fornecer e-mail e senha.' });
    }

    try {
        // 2. Buscar o usuário e forçar o carregamento da senha
        const user = await User.findOne({ email }).select('+senha');

        if (!user) {
            return res.status(401).send({ error: 'Credenciais inválidas.' });
        }

        // 3. Comparar a senha
        const isMatch = await user.comparePassword(senha);

        if (!isMatch) {
            return res.status(401).send({ error: 'Credenciais inválidas.' });
        }

        // 4. Responder com o token
        res.status(200).json({ token: createToken(user), user: { id: user._id, email: user.email, nivelAcesso: user.nivelAcesso } });

    } catch (error) {
        // 5. Tratamento de erro
        res.status(500).send({ error: 'Erro ao realizar login.', details: error.message });
    }
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
