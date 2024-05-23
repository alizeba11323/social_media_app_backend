const { AsyncHandler, CustomError } = require("../utils/features");
const jwt = require("jsonwebtoken");
const AuthMiddleware = AsyncHandler(async (req, res, next) => {
  const token = req.cookies["social_media_app_token"];
  if (!token) return next(new CustomError("Token Not Found", 401));
  const userId = await jwt.verify(token, process.env.JWT_SECRET);
  if (!userId) return next(new CustomError("UnAuthorized", 401));
  req.user = userId._id;
  next();
});

module.exports = { AuthMiddleware };
