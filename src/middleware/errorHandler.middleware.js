const environment = require("../config/environment");

const errorHandlerMiddleware = (error, req, res, next) => {
  console.error("\n=============== SERVER ERROR ===============");
  console.error(error);
  console.error("============================================\n");

  if (res.headersSent) {
    return next(error);
  }

  const statusCode = Number(error.statusCode || 500);

  return res.status(statusCode).json({
    success: false,
    message:
      environment.nodeEnv === "production"
        ? "Internal server error."
        : error.message || "Internal server error.",
  });
};

module.exports = errorHandlerMiddleware;
