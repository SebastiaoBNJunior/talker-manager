const validateToken = (req, res, next) => {
  const { authorization } = { ...req.headers };
  if (!authorization) {
    res.status(401).send({ message: 'Token não encontrado' });
  } else if (authorization.length !== 16 && typeof token !== 'string') {
    res.status(401).send({ message: 'Token inválido' });
  } else {
    next();
  }
};
  
module.exports = validateToken;