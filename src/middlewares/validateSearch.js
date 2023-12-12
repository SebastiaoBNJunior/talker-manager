const validateRateParam = (req, res, next) => {
  const { rate } = req.query;
  const rateNumber = parseFloat(rate);
  
  if (
    (rate !== undefined && !Number.isInteger(rateNumber))
      || rateNumber < 1
      || rateNumber > 5
  ) {
    res
      .status(400)
      .json({
        message: 'O campo "rate" deve ser um número inteiro entre 1 e 5',
      });
  } else {
    next();
  }
};
  
const validateDateParam = (req, res, next) => {
  const { date } = req.query;
  const DATE_REGEX = /^([0-2][0-9]|(3)[0-1])(\/)(((0)[0-9])|((1)[0-2]))(\/)\d{4}$/;
  
  if (date && !date.match(DATE_REGEX)) {
    res
      .status(400)
      .json({ message: 'O parâmetro "date" deve ter o formato "dd/mm/aaaa"' });
  } else {
    next();
  }
};
  
module.exports = {
  validateRateParam,
  validateDateParam,
};