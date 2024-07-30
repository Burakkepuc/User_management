const enums = require('../utils/enum')
const CustomError = require('../utils/error');
const bcrypt = require('bcrypt')
const { PrismaClient } = require('@prisma/client');
const Response = require('../utils/response');
const { createToken } = require('../middlewares/token');
const handleErrorResponse = require('../utils/handleError');

const prismaClient = new PrismaClient();

const register = async (req, res) => {
  try {
    console.log('Here');
    const { name, email, password, latitude, longitude } = req.body;

    console.log(1);

    const userCheck = await prismaClient.user.findUnique({
      where: { email }
    })

    console.log(2);

    if (userCheck) {
      return handleErrorResponse(res, enums.HTTP_CODES.CONFLICT, "User Exist !", "A user with this email or password already exists. Please use a different email address or password.")
    }

    console.log(3);

    hashedPassword = await bcrypt.hash(password, 10)
    console.log("hash şifre :" + req.body.password);

    console.log(4);


    const user = await prismaClient.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        location: {
          create: {
            latitude,
            longitude
          }
        },
      },
    })

    res.json(Response.successResponse(user))
  } catch (error) {
    console.log(error);
    let errorResponse = Response.errorResponse(error)
    res.status(errorResponse.code).json(errorResponse)
  }

}

const login = async (req, res) => {
  try {
    console.log('Here');
    const { email, password } = req.body

    const userCheck = await prismaClient.user.findUnique({
      where: { email }
    })
    if (!userCheck) {
      return handleErrorResponse(res, enums.HTTP_CODES.NOT_FOUND, "User Not Exist !", "A user with this email or password is not exist. Please check your email.password.")
    }

    const comparePassword = await bcrypt.compare(password, userCheck.password)


    if (!comparePassword) {
      return handleErrorResponse(res, enums.HTTP_CODES.NOT_FOUND, "User Not Exist !", "A user with this email or password is not exist. Please check your email.password.")
    }

    createToken(userCheck, res)
  } catch (error) {
    let errorResponse = Response.errorResponse(error)
    res.status(errorResponse.code).json(errorResponse)
  }
}

module.exports = { register, login } 