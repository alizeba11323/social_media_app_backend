const { AsyncHandler, CustomError } = require("../utils/features");
const PostModel = require("../models/post.model");
const cloudinary = require("cloudinary");
const fs = require("fs");
const CreatePost = AsyncHandler(async (req, res, next) => {
  const { content, tags } = req.body;
  console.log(tags);
  const image = req.file;
  if (!image) {
    return next(new CustomError("Please Select Any Image", 400));
  }
  try {
    const result = await cloudinary.v2.uploader.upload(image.path);
    const res_post = await PostModel.create({
      body: content,
      tags,
      creator: req.user,
      image: { public_id: result.public_id, url: result.url },
    });
    const post = await PostModel.findById(res_post._id).populate(
      "creator",
      "name  avatar"
    );
    return res.status(201).json({ message: "Post Created Successfully", post });
  } catch (err) {
    fs.unlinkSync(image.path);
    return next(err);
  } finally {
    fs.unlinkSync(image.path);
  }
});

const EditPost = AsyncHandler(async (req, res, next) => {
  const { tags, content } = req.body;
  const image = req.file;
  const { id } = req.params;
  const post = await PostModel.findById(id);
  if (!post) {
    return next(new CustomError("Post Not Found", 400));
  }
  if (req.user.toString() !== post.creator.toString())
    return next(new CustomError("You are not allowed to edit post", 401));
  if (image) {
    cloudinary.v2.uploader.destroy(post.image.public_id).then(() => {
      cloudinary.v2.uploader
        .upload(image.path)
        .then(async (result) => {
          const post = await PostModel.findByIdAndUpdate(
            id,
            {
              body: content,
              tags,
              image: { public_id: result.public_id, url: result.url },
            },
            { new: true, populate: "creator" }
          );
          return res.status(200).json({
            message: "POst Updated Successfully",
            post,
          });
        })
        .catch((err) => {
          fs.unlinkSync(image.path);
          return next(err);
        })
        .finally(() => {
          fs.unlinkSync(image.path);
        });
    });
  } else {
    const post = await PostModel.findByIdAndUpdate(
      id,
      { body: content, tags },
      { new: true, populate: "creator" }
    );
    return res.status(200).json({ message: "Post Updated Successfully", post });
  }
});
const DeletePost = AsyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const post = await PostModel.findById(id);
  if (!post) return next(new CustomError("Post Not Found", 400));
  if (req.user.toString() !== post.creator.toString())
    return next(new CustomError("You are not allowed to delete post", 401));
  cloudinary.v2.uploader.destroy(post.image.public_id).then(async () => {
    await PostModel.findByIdAndDelete(id);
    return res.status(200).json({ message: "post Deleted successfully", id });
  });
});
const GetSinglePost = AsyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const post = await PostModel.findById(id).populate(
    "creator",
    "_id name avatar followers"
  );
  return res.status(200).json({ post });
});
const GetAllPosts = AsyncHandler(async (req, res, next) => {
  let { search } = req.query;
  const searchParams = search
    ? { $or: [{ body: { $regex: search } }, { tags: { $regex: search } }] }
    : {};
  // : { creator: { $ne: req.user.toString() } };
  const posts = await PostModel.find(searchParams)
    .sort("-createdAt")
    .populate("creator", "_id name avatar followers");

  return res
    .status(200)
    .json({ posts, totalPost: await PostModel.countDocuments() });
});

const LikeDislikePost = AsyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const post = await PostModel.findById(id);
  if (!post) return next(new CustomError("Post Not Found", 400));
  if (req.user.toString() === post.creator.toString()) {
    return next(new CustomError("You can`t like your own post", 401));
  }
  if (post.likes.includes(req.user)) {
    const post = await PostModel.findByIdAndUpdate(
      id,
      { $pull: { likes: req.user } },
      { new: true, populate: "creator" }
    );
    return res.status(200).json({ message: "you dislike the post", post });
  } else {
    const post = await PostModel.findByIdAndUpdate(
      id,
      { $push: { likes: req.user } },
      { new: true, populate: "creator" }
    );
    return res.status(200).json({ message: "you liked the post", post });
  }
});

module.exports = {
  CreatePost,
  EditPost,
  DeletePost,
  GetAllPosts,
  GetSinglePost,
  LikeDislikePost,
};
