const mongoose = require("mongoose");

const postSchema = mongoose.Schema(
  {
    postText: {
      type: String,
      required: [true, "A post must have a text!"],
    },
    date: {
      type: Date,
      default: Date.now(),
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
    disLikes: {
      type: Number,
      default: 0,
    },
    disLikedBy: [
      {
        type: String,
      },
    ],
    user: {
      type: mongoose.Schema.ObjectId,
      required: [true, "Every post must have a user"],
    },
    commentAmount: Number,
    // comments: [{ type: mongoose.Schema.ObjectId, ref: "Comment" }],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

postSchema.virtual("comments", {
  ref: "Comment",
  foreignField: "post",
  localField: "_id",
});

postSchema.methods.count = function (countBy) {
  this.commentAmount = countBy.length;
};

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
