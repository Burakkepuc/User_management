const enums = require('../utils/enum')
const CustomError = require('../utils/error');
const bcrypt = require('bcrypt')
const { PrismaClient } = require('@prisma/client');
const Response = require('../utils/response');
const handleErrorResponse = require('../utils/handleError');
const { createToken } = require('../middlewares/token');
const upload = require('../utils/multerUpload');
const fs = require('fs')
const path = require('path')
const uploadDirectory = path.join(__dirname, '../../src/uploads');

const prismaClient = new PrismaClient();

const register = async (req, res) => {
  try {
    const { name, email, password, latitude, longitude } = req.body;


    const userCheck = await prismaClient.user.findUnique({
      where: { email }
    })


    if (userCheck) {
      return handleErrorResponse(res, enums.HTTP_CODES.CONFLICT, "User Exist !", "A user with this email or password already exists. Please use a different email address or password.")
    }

    hashedPassword = await bcrypt.hash(password, 10)


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
    let errorResponse = Response.errorResponse(error)
    res.status(errorResponse.code).json(errorResponse)
  }

}

const login = async (req, res) => {
  try {
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

const addProfilePicture = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded." });
    }

    if (req.fileValidationError) {
      return res.status(400).json({ error: req.fileValidationError });
    }


    const userId = 1 || req.user.id;
    const files = req.files;

    const avatars = await Promise.all(
      files.map(file => {
        return prismaClient.avatar.create({
          data: {
            url: file.path,
            userId: userId
          }
        });
      })
    );

    fs.rmdir(uploadDirectory, { recursive: true }, (err) => {
      if (err) {
        console.error(`Error removing directory: ${err.message}`);
      } else {
        console.log('Uploads directory removed successfully.');
      }
    });

    res.status(200).json({
      success: true,
      data: avatars
    });
  } catch (error) {
    let errorResponse = Response.errorResponse(error)
    res.status(errorResponse.code).json(errorResponse)
  }
};



module.exports = { register, login, addProfilePicture, addProfilePicture } 