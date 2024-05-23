const mongoose = require("mongoose");
const PostSchema = new mongoose.Schema(
  {
    body: {
      type: String,
      required: true,
    },
    tags: [{ type: String, required: true }],
    image: { public_id: String, url: String },
    creator: { type: mongoose.Types.ObjectId, ref: "User" },
    likes: [{ type: mongoose.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);
