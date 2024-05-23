const CommentModel = require("../models/comment.model");
const { AsyncHandler, CustomError } = require("../utils/features");

const CreateComment = AsyncHandler(async (req, res, next) => {
  const { content, reply, tag, postId } = req.body;
  const res_comment = await CommentModel.create({
    content,
    post: postId,
    user: req.user,
    tag: tag,
    commentReply: !!reply,
    repliesTo: reply,
  });
  if (reply) {
    await CommentModel.findByIdAndUpdate(
      reply,
      {
        $push: { reply: res_comment._id },
      },
      { new: true }
    );
  }
  return res.status(201).json({
    message: "Comment Created Successfully",
  });
});
const DeleteComment = AsyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const comment = await CommentModel.findById(id);
  if (!comment) return next(new CustomError("Comment Not Found", 400));
  if (comment.user.toString() !== req.user.toString()) {
    return next(new CustomError("you canot edit comment", 401));
  }
  if (comment.commentReply && comment.tag) {
    const res = await CommentModel.findByIdAndUpdate(comment.repliesTo, {
      $pull: { reply: id },
    });
  } else if (comment.commentReply) {
    await CommentModel.findByIdAndUpdate(comment.repliesTo, {
      $pull: { reply: id },
    });
    if (comment.reply.length > 0)
      await CommentModel.deleteMany({ _id: { $in: comment.reply } });
  } else {
    await CommentModel.deleteMany({
      $or: [
        { _id: { $in: comment.reply } },
        { repliesTo: { $in: comment.reply } },
      ],
    });
  }
  await CommentModel.findByIdAndDelete(id);
  res.status(200).json({ message: "Comment Updated Successfully", id });
});
const EditComment = AsyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { content } = req.body;
  const comment = await CommentModel.findById(id);
  if (!comment) return next(new CustomError("Comment Not Found", 400));
  if (comment.user.toString() !== req.user.toString()) {
    return next(new CustomError("you canot edit comment", 401));
  }
  const res_comment = await CommentModel.findByIdAndUpdate(
    id,
    {
      content,
    },
    { new: true }
  );
  res
    .status(200)
    .json({ message: "Comment Updated Successfully", comment: res_comment });
});
const LikeComment = AsyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const comment = await CommentModel.findById(id);
  if (!comment) return next(new CustomError("Comment Not Found", 400));
  if (comment.user.toString() === req.user.toString()) {
    return next(new CustomError("you canot like  your own comment", 401));
  }
  if (comment.likes.includes(req.user)) {
    const res_comment = await CommentModel.findByIdAndUpdate(
      id,
      { $pull: { likes: req.user } },
      { new: true }
    );
    res
      .status(200)
      .json({ message: "You dislike the comment", comment: res_comment });
  } else {
    const res_comment = await CommentModel.findByIdAndUpdate(
      id,
      {
        $push: { likes: req.user },
      },
      { new: true }
    );
    res
      .status(200)
      .json({ message: "You liked the comment", comment: res_comment });
  }
});
const GetAllComments = AsyncHandler(async (req, res, next) => {
  const { postId } = req.params;
  const comments = await CommentModel.find({
    post: postId,
    commentReply: false,
  })
    .sort("-createdAt")
    .populate("user", "avatar username _id")
    .populate({
      path: "reply",
      populate: [
        { path: "reply", populate: [{ path: "user tag" }] },
        { path: "user tag" },
      ],
    });
  return res.status(200).json({ comments });
});

module.exports = {
  CreateComment,
  DeleteComment,
  GetAllComments,
  LikeComment,
  EditComment,
};
