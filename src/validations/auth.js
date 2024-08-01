const { body, validationResult } = require('express-validator');

const registerValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().notEmpty().withMessage('Invalid email format'),
  body('password').notEmpty().isLength({ min: 3, max: 30 }).withMessage('Password must be at least 3 characters, max 30 character'),
  body('latitude').isFloat().notEmpty().withMessage('Latitude must be a valid number'),
  body('longitude').isFloat().notEmpty().withMessage('Longitude must be a valid number'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: { msg: errors.array()[0].msg, path: errors.array()[0].path } });
    }
    next();
  }
];

const loginValidation = [
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').notEmpty().withMessage('Password is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: { msg: errors.array()[0].msg, path: errors.array()[0].path } });
    }
    next();
  }
];

module.exports = { registerValidation, loginValidation };
