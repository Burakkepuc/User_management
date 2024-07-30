const enums = require('./enum');
const CustomError = require('./error');

class Response {
  constructor() { }

  static successResponse(data, code = 200) {
    return {
      code,
      data
    }
  }

  static errorResponse(error) {
    if (error instanceof CustomError) {
      return {
        code: error.code,
        error: {
          message: error.message,
          description: error.description
        }
      }
    }

    return {
      code: enums.HTTP_CODES.INT_SERVER_ERROR,
      error: {
        message: error.message,
        description: error.description
      }
    }
  }
}


module.exports = Response;