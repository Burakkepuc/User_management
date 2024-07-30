var express = require('express');
const { verifyToken } = require('../middlewares/token');
var router = express.Router();

/* GET users listing. */
router.get('/user', function (req, res, next) {
  res.send('respond with a resource');
});
router.get('/userss', verifyToken, function (req, res, next) {
  res.send('respond with a resource 22222222');
});

module.exports = router;