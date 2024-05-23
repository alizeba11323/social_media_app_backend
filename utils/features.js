const AsyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (err) {
    next(err);
  }
};

class CustomError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

const ErrorHandler = (err, req, res, next) => {
  let message = err.message || "Something went wrong";
  let statusCode = err.statusCode || 500;
  if (err.code === 11000) {
    message = `${Object.keys(err.keyPattern)[0]} is already exists`;
    statusCode = 400;
  }
  res.status(statusCode).json({ message });
  next();
};
module.exports = { AsyncHandler, CustomError, ErrorHandler };
