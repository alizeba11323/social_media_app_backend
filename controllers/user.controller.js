const { AsyncHandler, CustomError } = require("../utils/features");
const fs = require("fs");
const UserModel = require("../models/user.model");
const cloudinary = require("cloudinary");
const SignUp = AsyncHandler(async (req, res, next) => {
  const { name, username, email, password } = req.body;
  const avatar = req.file;
  if (!avatar) {
    return next(new CustomError("Please Select Any Image", 400));
  }
  const usernameCheck = await UserModel.findOne({ username });
  if (usernameCheck)
    return next(new CustomError("Username Already Exists", 400));
  const user = await UserModel.findOne({ email });
  if (user) return next(new CustomError("Email Already Exists", 400));

  cloudinary.v2.uploader
    .upload(avatar.path)
    .then(async (result) => {
      const newUser = await UserModel.create({
        name,
        username,
        email,
        password,
        avatar: { public_id: result.public_id, url: result.url },
      });
      const token = await newUser.genToken({ _id: newUser._id });
      return res
        .status(201)
        .cookie("social_media_app_token", token, {
          httpOnly: true,
          sameSite: "none",
          secure: true,
          maxAge: process.env.EXPIRES_IN * 24 * 60 * 60 * 1000,
        })
        .json({ message: "User Signup Successfully", token });
    })
    .catch((err) => {
      return next(err);
    })
    .finally(() => {
      fs.unlinkSync(avatar.path);
    });
});

const Login = AsyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email }).select("+password");
  if (!user) return next(new CustomError("Email Not Found", 400));
  const isMatch = await user.comparePassword(password);
  if (!isMatch) return next(new CustomError("Password Not Matched", 400));
  const token = await user.genToken({ _id: user._id });
  return res
    .status(200)
    .cookie("social_media_app_token", token, {
      httpOnly: true,
      maxAge: process.env.EXPIRES_IN * 24 * 60 * 60 * 1000,
    })
    .json({ message: "User LoggedIn Successfully", token });
});
const GetMe = AsyncHandler(async (req, res, next) => {
  const userId = req.user;
  const user = await UserModel.findById(userId).populate("savedPost");
  if (!user) return next(new CustomError("User Not Found", 400));
  return res.status(200).json({ user });
});
const Logout = AsyncHandler(async (req, res, next) => {
  return res
    .status(200)
    .cookie("social_media_app_token", "", {
      httpOnly: true,
      maxAge: 0,
    })
    .json({ message: "Logout Successfully" });
});
const SearchUser = AsyncHandler(async (req, res, next) => {
  const { username } = req.params;
  const users = await UserModel.find({
    _id: { $ne: req.user },
    username: { $regex: username },
  })
    .limit(10)
    .select("username avatar name");
  res.status(200).json({ users });
});
const SavedPost = AsyncHandler(async (req, res, next) => {
  const { postId } = req.body;
  const user = await UserModel.findById(req.user);
  if (user.savedPost.includes(postId)) {
    const updateuser = await UserModel.findByIdAndUpdate(
      req.user,
      { $pull: { savedPost: postId } },
      { new: true, populate: "savedPost" }
    );
    res.status(200).json({ message: "Remove Saved Post", user: updateuser });
  } else {
    const updateuser = await UserModel.findByIdAndUpdate(
      req.user,
      { $push: { savedPost: postId } },
      { new: true, populate: "savedPost" }
    );
    res.status(200).json({ message: "Saved Post", user: updateuser });
  }
});
const GetUser = AsyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const user = await UserModel.findById(id)
    .populate("savedPost")
    .select("-password");
  res.status(200).json({ user });
});
const GetAllUsers = AsyncHandler(async (req, res, next) => {
  const users = await UserModel.find({
    _id: { $ne: req.user.toString() },
  }).limit(6);
  res.status(200).json({ users });
});
const UpdateProfile = AsyncHandler(async (req, res, next) => {
  const { name, email, bio, address, username } = req.body;
  const avatar = req.file;
  const userId = req.user;
  const user = await UserModel.findById(userId);
  if (!user) {
    return next(new CustomError("User Not Found", 400));
  }
  if (avatar) {
    cloudinary.v2.uploader.destroy(user.avatar.public_id).then(() => {
      cloudinary.v2.uploader
        .upload(avatar.path)
        .then(async (result) => {
          const newUser = await UserModel.findByIdAndUpdate(
            userId,
            {
              name,
              username,
              email,
              bio,
              address,
              avatar: { public_id: result.public_id, url: result.url },
            },
            { new: true }
          );
          res.status(200).json({
            message: "User Profile Updated Successfully",
            user: newUser,
          });
        })
        .catch((err) => {
          next(err);
        })
        .finally(() => {
          fs.unlinkSync(avatar.path);
        });
    });
  } else {
    const newUser = await UserModel.findByIdAndUpdate(
      userId,
      {
        name,
        username,
        email,
        bio,
        address,
      },
      { new: true }
    );
    return res.status(200).json({
      message: "User Profile Updated Successfully",
      user: newUser,
    });
  }
});
const FollowUnFollowUser = AsyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const user = await UserModel.findOne({ _id: req.user, followings: id });
  if (user) {
    await UserModel.findByIdAndUpdate(id, { $pull: { followers: req.user } });
    await UserModel.findByIdAndUpdate(req.user, { $pull: { followings: id } });
    return res.status(200).json({ message: "unfollow user successfully", id });
  } else {
    await UserModel.findByIdAndUpdate(id, {
      $push: { followers: req.user },
    });
    await UserModel.findByIdAndUpdate(req.user, { $push: { followings: id } });
    return res.status(200).json({ message: "follow user successfully", id });
  }
});
module.exports = {
  SignUp,
  Login,
  GetMe,
  Logout,
  SearchUser,
  GetUser,
  UpdateProfile,
  FollowUnFollowUser,
  GetAllUsers,
  SavedPost,
};
