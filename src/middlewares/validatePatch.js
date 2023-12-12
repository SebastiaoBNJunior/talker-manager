const validateRatePatch = (req, res, next) => {
  const { rate } = req.body;
  
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
  
module.exports = validateRatePatch;