const express = require("express");

const router = express.Router();
const ConversationController = require("../controllers/conversation.controller");
const { AuthMiddleware } = require("../middlewares/auth.middleware");

router
  .route("/create-message")
  .post(AuthMiddleware, ConversationController.CreateMessage);
router.get(
  "/conversations",
  AuthMiddleware,
  ConversationController.GetAllConversations
);
router
  .route("/:conversationId")
  .get(AuthMiddleware, ConversationController.getAllMessages);

module.exports = router;
