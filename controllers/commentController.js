const Comment = require("../models/commentModel");
const Post = require("../models/postModel");
const AppError = require("../utils/appError");
const catchAsyncError = require("../utils/catchAsyncError");
const { success } = require("../utils/sucessRes");
const common = require("./commonController");

let comments, comment, newComment, updatedComment;
const createOptions = ["commentText", "user", "post"];
const updateOptions = ["commentText"];

exports.getAllComments = common.getAll(Comment, comments);

exports.createComment = common.createOne(Comment, newComment, createOptions);

exports.updateComment = common.updateOne(
  Comment,
  updatedComment,
  updateOptions
);

exports.deleteComment = common.deleteOne(Comment, comment);

exports.getCommment = catchAsyncError(async (req, res, next) => {
  comment = await Comment.findById(req.params.id);
  if (!comment) {
    new next(AppError("No document found with that id!", 404));
  }
  success(res, "200", comment);
});

exports.likeComment = common.likeOne(Comment, comment);

exports.disLikeComment = common.disLikeOne(Comment, comment);

exports.removeLike = common.removeLike(Comment, comment);

exports.removeDislike = common.removeDisLike(Comment, comment);

exports.removeComment = catchAsyncError(async (req, res, next) => {
  const post = await Post.findById(req.params.postId);

  if (!post) {
    return next(new AppError("No post found!", 404));
  }

  const comment = await Comment.findById(req.params.commentId);

  if (!comment) {
    return next(new AppError("No comment found!", 404));
  }

  if (!(post.user == req.user.id)) {
    return next(
      new AppError("You do not have the rights to perform this action!", 401)
    );
  }

  await Comment.findByIdAndDelete(comment.id);

  res.status(204).json({
    status: "success",
    message: "Comment deleted successfully",
  });
});
