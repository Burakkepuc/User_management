var express = require('express');
const upload = require('../utils/multerUpload');
const { register, login, addProfilePicture } = require('../controllers/auth');
const { registerValidation, loginValidation } = require('../validations/auth');

var router = express.Router();

/* GET users listing. */
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/add_profile_picture', upload.array('photos', 12), addProfilePicture)

module.exports = router;