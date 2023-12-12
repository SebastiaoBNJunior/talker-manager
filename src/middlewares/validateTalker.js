const validateName = (req, res, next) => {
  const { name } = req.body;
  
  if (!name) {
    res.status(400).json({ message: 'O campo "name" é obrigatório' });
  } else if (name.length < 4) {
    res
      .status(400)
      .json({ message: 'O "name" deve ter pelo menos 3 caracteres' });
  } else {
    next();
  }
};
  
const validateAge = (req, res, next) => {
  const { age } = req.body;
  
  if (!age) {
    res.status(400).json({ message: 'O campo "age" é obrigatório' });
  } else if (!Number.isInteger(age) || age < 18) {
    res
      .status(400)
      .json({
        message:
            'O campo "age" deve ser um número inteiro igual ou maior que 18',
      });
  } else {
    next();
  }
};
  
const validateTalk = (req, res, next) => {
  const { talk } = req.body;
  
  if (!talk) {
    res.status(400).json({ message: 'O campo "talk" é obrigatório' });
  } else {
    next();
  }
};
  
const validateWatchedAt = (req, res, next) => {
  const { watchedAt } = req.body.talk;
  const DATE_REGEX = /^([0-2][0-9]|(3)[0-1])(\/)(((0)[0-9])|((1)[0-2]))(\/)\d{4}$/;
  
  if (!watchedAt) {
    res.status(400).json({ message: 'O campo "watchedAt" é obrigatório' });
  } else if (!watchedAt.match(DATE_REGEX)) {
    res
      .status(400)
      .json({ message: 'O campo "watchedAt" deve ter o formato "dd/mm/aaaa"' });
  } else {
    next();
  }
};
  
const validateRate = (req, res, next) => {
  const { rate } = req.body.talk;
  
  if (rate === undefined) {
    res.status(400).json({ message: 'O campo "rate" é obrigatório' });
  } else if (rate < 1 || rate > 5 || !Number.isInteger(rate)) {
    res
      .status(400)
      .json({
        message: 'O campo "rate" deve ser um número inteiro entre 1 e 5',
      });
  } else {
    next();
  }
};
  
module.exports = {
  validateName,
  validateAge,
  validateTalk,
  validateWatchedAt,
  validateRate,
};