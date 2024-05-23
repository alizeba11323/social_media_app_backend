const express = require("express");
const { singleUpload } = require("../helpers/helper");
const {
  SignUpValidator,
  CheckError,
  LoginValidator,
} = require("../helpers/validation");
const UserController = require("../controllers/user.controller");
const { AuthMiddleware } = require("../middlewares/auth.middleware");
const router = express.Router();

router.post(
  "/signup",
  singleUpload,
  SignUpValidator,
  CheckError,
  UserController.SignUp
);
router.patch("/saved-post", AuthMiddleware, UserController.SavedPost);
router.post("/login", LoginValidator, CheckError, UserController.Login);
router.get("/me", AuthMiddleware, UserController.GetMe);
router.get("/logout", AuthMiddleware, UserController.Logout);
router.get("/search/:username", AuthMiddleware, UserController.SearchUser);
router.get("/get-users", AuthMiddleware, UserController.GetAllUsers);
router.get("/single-user/:id", AuthMiddleware, UserController.GetUser);
router.patch(
  "/update-profile",
  singleUpload,
  AuthMiddleware,
  UserController.UpdateProfile
);
router.patch(
  "/follow-unfollow/:id",
  AuthMiddleware,
  UserController.FollowUnFollowUser
);
module.exports = router;
