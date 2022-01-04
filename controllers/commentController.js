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

exports.createComment = catchAsyncError(async (req, res, next) => {
  const post = req.body.post;
  const user = req.user;
  const commentText = req.body.commentText;

  if (!post || !user || !commentText) {
    return next(
      new AppError(
        "Incomplete information provided, please provide post and commentText",
        400
      )
    );
  }

  savedPost = await Post.findById(post);

  if (!savedPost) {
    return next(new AppError("No post found with that id!", 404));
  }

  data = {
    post: post,
    user: user,
    commentText: commentText,
  };

  await Comment.create(data);

  res.status(200).json({
    status: "success",
    message: "Comment successfully created!",
    data: { data },
  });
});

exports.updateComment = catchAsyncError(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    return next(new AppError("No comment found with that id!", 404));
  }

  if (!(req.user.id == comment.user)) {
    return next(new AppError("You are not authorized to perform this action!"));
  }

  commentText = req.body.commentText;

  await Comment.findByIdAndUpdate(req.params.id, {
    commentText,
  });

  res.status(200).json({
    status: "success",
    message: "Comment updated successfully",
  });
});

exports.deleteComment = common.deleteOne(Comment, comment);

exports.getCommment = catchAsyncError(async (req, res, next) => {
  comment = await Comment.findById(req.params.id);
  if (!comment) {
    next(new AppError("No document found with that id!", 404));
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
