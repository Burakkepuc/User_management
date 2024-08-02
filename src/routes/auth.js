var express = require('express');
const { register, login } = require('../controllers/auth');
const { registerValidation, loginValidation } = require('../validations/auth');

var router = express.Router();

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

module.exports = router;