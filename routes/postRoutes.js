const express = require("express");
const postController = require("../controllers/postController");
const authController = require("../controllers/authController");
// const commentController = require("../controllers/commentController");
const router = express.Router();

router.use(authController.checkAPIUser);
router.use(authController.protectRoutes);

router
  .route("/")
  .get(postController.getAllUsersFriendsPosts)
  .post(postController.createPost);

router
  .route("/:id")
  .get(postController.getPost)
  .patch(postController.updatePost)
  .delete(postController.deletePost);

// router.get("/posts", postController.getAllUsersFriendsPosts);

router.route("/like/:id").patch(postController.likePost);

router.route("/like/remove/:id").patch(postController.removeLike);

router.route("/dislike/:id").patch(postController.disLikePost);

router.route("/dislike/remove/:id").patch(postController.removeDisLike);

// router.get("/:post", commentController.getPostComment);

module.exports = router;
