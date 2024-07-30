const enums = require('../utils/enum');
const Response = require("../utils/response");
const handleErrorResponse = require("../utils/handleError");
const jwt = require('jsonwebtoken')
require("dotenv").config();



const createToken = async (user, res) => {
  try {
    const payload = {
      id: user.id,
      name: user.name,
      email: user.email
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: "2d" })
    return res.json(Response.successResponse(token))

  } catch (error) {
    let errorResponse = Response.errorResponse(error)
    res.status(errorResponse.code).json(errorResponse)
  }
}

const verifyToken = async (req, res, next) => {
  const headerToken = req.headers['authorization'] && req.headers['authorization'].startsWith("Bearer")
  console.log(headerToken);
  if (!headerToken) {
    return handleErrorResponse(res, enums.HTTP_CODES.UNAUTHORIZED, 'Invalid Session', 'Please sign in');
  }

  const token = req.headers['authorization'].split(' ')[1]
  console.log(token);

  jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, decoded) => {
    if (err) {
      return handleErrorResponse(res, enums.HTTP_CODES.UNAUTHORIZED, 'Invalid Token', 'Please check your token')
    }
    req.user = decoded;
    next();
  })

}

module.exports = { createToken, verifyToken }