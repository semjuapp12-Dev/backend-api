module.exports = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.nivelAcesso)) {
      return res.status(403).json({ error: 'Acesso negado.' });
    }
    next();
  };
};
