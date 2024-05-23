const express = require("express");
const { AuthMiddleware } = require("../middlewares/auth.middleware");
const { createPostValidator, CheckError } = require("../helpers/validation");
const { singlePostImageUpload } = require("../helpers/helper");
const PostController = require("../controllers/post.controller");
const CommentController = require("../controllers/comment.controller");
const router = express.Router();

router.post(
  "/create-post",
  AuthMiddleware,
  singlePostImageUpload,
  createPostValidator,
  CheckError,
  PostController.CreatePost
);
router.get("/get-all-posts", AuthMiddleware, PostController.GetAllPosts);
router
  .route("/:id")
  .get(AuthMiddleware, PostController.GetSinglePost)
  .patch(
    AuthMiddleware,
    singlePostImageUpload,
    createPostValidator,
    CheckError,
    PostController.EditPost
  )
  .delete(AuthMiddleware, PostController.DeletePost);
router
  .route("/like-dislike/:id")
  .patch(AuthMiddleware, PostController.LikeDislikePost);
router
  .route("/create-comment")
  .post(AuthMiddleware, CommentController.CreateComment);
router
  .route("/get-all-comments/:postId")
  .get(AuthMiddleware, CommentController.GetAllComments);
router
  .route("/comments/:id")
  .patch(AuthMiddleware, CommentController.EditComment)
  .delete(AuthMiddleware, CommentController.DeleteComment);
router
  .route("/comments/like-dislike/:id")
  .patch(AuthMiddleware, CommentController.LikeComment);
module.exports = router;
