var express = require('express');
const { verifyToken } = require('../middlewares/token');
const nearbyUsers = require('../controllers/users');
var router = express.Router();

/* GET users listing. */
router.get('/nearby_users/:km', nearbyUsers);


module.exports = router;