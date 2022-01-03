const mongoose = require("mongoose");

const commentSchema = mongoose.Schema(
  {
    commentText: {
      type: String,
      required: [true, "A comment must have content!"],
    },
    likes: {
      type: Number,
      default: 0,
    },
    likedBy: [
      {
        type: String,
      },
    ],
    disLikedBy: [
      {
        type: String,
      },
    ],
    disLikes: {
      type: Number,
      default: 0,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      required: [true, "Every comment must have a user"],
    },
    date: {
      type: Date,
      default: Date.now(),
    },
    post: {
      type: mongoose.Schema.ObjectId,
      ref: "Post",
      required: [true, "Every comment must belong to a post"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// commentSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: "post",
//     select: "_id, postText",
//   });
//   next();
// });

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
