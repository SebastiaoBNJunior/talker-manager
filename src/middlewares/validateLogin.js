const validateEmail = (req, res, next) => {
  const { email } = req.body;
  const EMAIL_REGEX = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
  
  if (!email) {
    res.status(400).json({ message: 'O campo "email" é obrigatório' });
  } else if (!email.match(EMAIL_REGEX)) {
    res
      .status(400)
      .json({ message: 'O "email" deve ter o formato "email@email.com"' });
  } else {
    next();
  }
};
  
const validatePassword = (req, res, next) => {
  const { password } = req.body;
  
  if (!password) {
    res.status(400).json({ message: 'O campo "password" é obrigatório' });
  } else if (password.length < 7) {
    res
      .status(400)
      .json({ message: 'O "password" deve ter pelo menos 6 caracteres' });
  } else {
    next();
  }
};
  
module.exports = {
  validateEmail,
  validatePassword,
};
