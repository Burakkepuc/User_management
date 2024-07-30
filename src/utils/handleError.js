const CustomError = require("./error");
const Response = require("./response");

const handleErrorResponse = (res, code, message, description) => {
  const error = new CustomError(code, message, description);
  const errorResponse = Response.errorResponse(error);
  res.status(errorResponse.code).json(errorResponse);
};

module.exports = handleErrorResponse