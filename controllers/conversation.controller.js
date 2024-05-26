const ConversationModel = require("../models/conversation.model");
const MessageModel = require("../models/message.model");
const { AsyncHandler } = require("../utils/features");
const CreateMessage = AsyncHandler(async (req, res, next) => {
  const { reciever, text, media } = req.body;

  const conversation = await ConversationModel.findOneAndUpdate(
    {
      $or: [
        { recipients: [req.user, reciever] },
        { recipients: [reciever, req.user] },
      ],
    },
    { text, media, recipients: [req.user, reciever] },
    { new: true, upsert: true }
  );
  const message = await MessageModel.create({
    conversation: conversation._id,
    text,
    media,
    sender: req.user,
    reciever,
  });
  const newMessage = await MessageModel.findById(message._id)
    .populate("sender reciever")
    .populate({
      path: "conversation",
      populate: {
        path: "recipients",
      },
    });
  return res.status(201).json({ message: newMessage });
});

const getAllMessages = AsyncHandler(async (req, res, next) => {
  const { conversationId } = req.params;
  if (!conversationId) return res.status(200).json({ messages: [] });
  const messages = await MessageModel.find({
    conversation: conversationId,
  }).populate("conversation sender reciever");
  return res.status(200).json({ messages });
});

const GetAllConversations = AsyncHandler(async (req, res, next) => {
  const conversations = await ConversationModel.find({
    recipients: req.user,
  }).populate("recipients");
  res.status(200).json({ conversations });
});

module.exports = {
  CreateMessage,
  getAllMessages,
  GetAllConversations,
};
