"use strict";

const Joi = require("joi");
const hl = require("highland");

const schema = Joi.object().keys({
  id: Joi.string().required(),
  score: Joi.number().integer().required()
});

const options = {
  allowUnknown: true
};

module.exports = {
  sync: item => Joi.validate(item, schema, options),

  stream: hl.wrapCallback((item, cb) => Joi.validate(item, schema, options, cb))
};
