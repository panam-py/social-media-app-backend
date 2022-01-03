const Post = require("../models/postModel");
const common = require("./commonController");
const catchAsyncError = require("../utils/catchAsyncError");
const { success } = require("../utils/sucessRes");
const AppError = require("../utils/appError");
const User = require("../models/userModel");

let posts, post, newComment, updatedComment;
const createOptions = ["postText", "user"];
const updateOptions = ["postText"];

exports.getAllPosts = common.getAll(Post, posts);

exports.createPost = common.createOne(Post, newComment, createOptions);

exports.updatePost = common.updateOne(Post, updatedComment, updateOptions);

exports.deletePost = common.deleteOne(Post, post);

exports.getAllUsersFriendsPosts = catchAsyncError(async (req, res, next) => {
  const posts = await Post.find();
  const userFriends = req.user.friends;
  const userFriendsIds = [];

  await Promise.all(
    userFriends.map(async (el) => {
      const friend = await User.find({ slug: el });
      userFriendsIds.push(friend);
    })
  );

  const userFriendsPosts = [];

  posts.map((post) => {
    userFriendsIds.map((friend) => {
      if (post.user === friend.id) {
        userFriendsPosts.push(post);
      }
    });
  });

  success(res, "200", userFriendsPosts);
});

exports.getPost = catchAsyncError(async (req, res, next) => {
  const post = await Post.findById(req.params.id).populate({
    path: "comments",
  });
  if (!post) {
    next(new AppError("No document found with that id!", 404));
  }
  post.count(post.comments);

  success(res, "200", post);
});

exports.likePost = common.likeOne(Post, post);
exports.disLikePost = common.disLikeOne(Post, post);
exports.removeLike = common.removeLike(Post, post);
exports.removeDisLike = common.removeDisLike(Post, post);
