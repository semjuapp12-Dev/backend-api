const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();

const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
};

const jwtLogin = new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
        // Busca o usuário pelo ID, mas não inclui a senha
        const user = await User.findById(payload.sub);

        if (user) {
            // Se o usuário for encontrado, passa para o próximo middleware
            done(null, user);
        } else {
            // Se o usuário não for encontrado
            done(null, false);
        }
    } catch (error) {
        done(error, false);
    }
});

// Inicializa o Passport com a estratégia JWT
passport.use(jwtLogin);

// Middleware de autenticação que pode ser usado nas rotas
const requireAuth = passport.authenticate('jwt', { session: false });

// Middleware de permissão para verificar o nível de acesso
const requirePermission = (allowedRoles) => (req, res, next) => {
    if (!req.user) {
        return res.status(401).send({ error: 'Acesso negado. Token inválido ou ausente.' });
    }

    if (allowedRoles.includes(req.user.nivelAcesso)) {
        // Se o usuário tiver a permissão necessária, continua
        next();
    } else {
        // Se o usuário não tiver a permissão
        res.status(403).send({ error: 'Permissão negada. Você não tem o nível de acesso necessário.' });
    }
};

module.exports = {
    requireAuth,
    requirePermission
};
