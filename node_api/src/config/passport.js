const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy; // Importando estratégia JWT
const ExtractJwt = require('passport-jwt').ExtractJwt; // Utilitário para extrair o token
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();

module.exports = function(passport) {
    // --- ESTRATÉGIA 1: LOGIN LOCAL (Email + Senha) ---
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'senha' 
    }, async (email, senha, done) => {
        try {
            const user = await User.findOne({ email }).select('+senha');
            if (!user) return done(null, false, { message: 'Email não cadastrado.' });

            const isMatch = await user.comparePassword(senha);
            if (!isMatch) return done(null, false, { message: 'Senha incorreta.' });

            return done(null, user);
        } catch (err) {
            console.error(err);
            return done(err);
        }
    }));

    // --- ESTRATÉGIA 2: JWT (Autenticação por Token) ---
    // Isso é usado para proteger rotas como /api/content/eventos
    const opts = {};
    // Diz ao passport para procurar o token no Header: "Authorization: Bearer <token>"
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
    opts.secretOrKey = process.env.JWT_SECRET;

    passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
        try {
            // O payload do token pode ter 'sub' (padrão) ou 'id' (usado no login recente)
            // Vamos checar os dois para garantir
            const userId = jwt_payload.sub || jwt_payload.id;

            const user = await User.findById(userId);

            if (user) {
                return done(null, user); // Usuário encontrado e autenticado
            } else {
                return done(null, false); // Token válido, mas usuário não existe mais
            }
        } catch (err) {
            return done(err, false);
        }
    }));
};