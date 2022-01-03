const express = require("express");
const commentController = require("../controllers/commentController");
const authController = require("../controllers/authController");

const router = express.Router();

router.use(authController.checkAPIUser);

router
  .route("/")
  //   .get(commentController.getAllComments)
  .post(authController.protectRoutes, commentController.createComment);

router
  .route("/:id")
  .get(commentController.getCommment)
  .patch(authController.protectRoutes, commentController.updateComment)
  .delete(authController.protectRoutes, commentController.deleteComment);

router.use(authController.protectRoutes);

router.patch("/like/:id", commentController.likeComment);
router.patch("/like/remove/:id", commentController.removeLike);
router.patch("/dislike/:id", commentController.disLikeComment);
router.patch("/dislike/remove/:id", commentController.removeDislike);

router.delete("/:postId/:commentId", commentController.removeComment);

module.exports = router;
