// const AppError = require("../utils/appError");

const sendErrorDev = (err, req, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, req, res) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  console.log("Error: ", err);

  // Send Generic Error in Production
  return res.status(500).json({
    status: "error",
    message: "Something went wrong",
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.ENV === "development") {
    sendErrorDev(err, req, res);
  } else if (process.env.ENV === "production") {
    sendErrorProd(err, req, res);
  }
};
