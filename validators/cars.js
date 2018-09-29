const Joi = require('joi');

const schema = Joi.object().keys({
  title: Joi.string().min(6).max(128).required(),
  number: Joi.string().alphanum().min(4).max(10).required(),
  model: Joi.string()
});

module.exports = (req, res, next) => {
  const {title, model, number} = req.body;

  const result = Joi.validate({title,model,number}, schema);

  if (result.error) {
    return res.status(400).json(result.error);
  }

  next();
}