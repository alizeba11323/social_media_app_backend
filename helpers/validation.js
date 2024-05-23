const { body, validationResult } = require("express-validator");

const SignUpValidator = [
  body("name").notEmpty().withMessage("Name is Required"),
  body("username").notEmpty().withMessage("Username is Required"),
  body("email")
    .notEmpty()
    .withMessage("email is Required")
    .isEmail()
    .withMessage("Email Must be Valid"),
  body("password").notEmpty().withMessage("Password is Required"),
];

const createPostValidator = [
  body("content").notEmpty().withMessage("Content is Required"),
  body("tags")
    .isArray({ min: 1 })
    .withMessage("Must Be Array and Contain 1 element"),
];

const LoginValidator = [
  body("email").notEmpty().withMessage("Email is Required"),
  body("password").notEmpty().withMessage("Password is Required"),
];

const CheckError = (req, res, next) => {
  const result = validationResult(req);
  if (result.errors.length > 0) {
    const errors = result.errors.map((error) => error.msg);
    return res.status(400).json({ errors });
  }
  next();
};
module.exports = {
  SignUpValidator,
  CheckError,
  LoginValidator,
  createPostValidator,
};
