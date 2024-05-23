const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    post: {
      type: mongoose.Schema.ObjectId,
      ref: "Post",
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    commentReply: {
      type: Boolean,
      default: false,
    },
    repliesTo: { type: mongoose.Schema.ObjectId, ref: "Comment" },
    tag: { type: mongoose.Schema.ObjectId, ref: "User" },
    likes: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
    reply: [{ type: mongoose.Schema.ObjectId, ref: "Comment" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", commentSchema);
