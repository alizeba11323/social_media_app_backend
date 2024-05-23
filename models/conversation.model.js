const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema(
  {
    recipients: [{ type: mongoose.Types.ObjectId, ref: "User" }],
    text: String,
    media: { public_id: String, url: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", ConversationSchema);
