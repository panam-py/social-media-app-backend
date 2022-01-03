const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "No email provided for user!"],
      validate: [validator.isEmail, "Please provide a valid email"],
      lowercase: true,
      unique: [true, "There is already an account with this email address!"],
    },
    username: {
      type: String,
      required: [true, "Please provide a username for user!"],
      unique: [
        true,
        "Username already taken by another user, please choose a different username.",
      ],
      min: [5, "Username length cannot be less than 5 characters"],
      max: [10, "Username length cannot be more than 10 characters"],
    },
    slug: String,
    active: {
      type: Boolean,
      default: true,
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      select: false,
      min: [8, "Password length must not be less than 8 characters"],
      max: [20, "Password length must not be more than 20 characters"],
      select: false,
    },
    confirmPassword: {
      type: String,
      required: [true, "Please confirm password created above!"],
      validate: {
        validator: function (val) {
          return val === this.password;
        },
        message: "Password andd confirmPassword must be the same",
      },
    },
    passwordChangeDate: {
      type: Date,
      select: false,
    },
    reports: {
      type: Number,
      default: 0,
    },
    reportedBy: [
      {
        type: String,
      },
    ],
    friends: [
      {
        type: String,
      },
    ],
    friendRequestsRecievedDetails: [
      {
        type: Object,
      },
    ],
    friendRequestsSentDetails: [
      {
        type: Object,
      },
    ],
    postAmount: Number,
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.virtual("posts", {
  ref: "Post",
  foreignField: "user",
  localField: "_id",
});

userSchema.virtual("comments", {
  ref: "Comment",
  foreignField: "user",
  localField: "_id",
});

// userSchema.pre("save", function (next) {
//   if (this.isModified("active")) {
//     console.log("Account deleted");
//     this.deleteTime = Date.now();
//   }
//   console.log("Done");
//   next();
// });

// userSchema.pre(/^find/, function (next) {
//   this.find({ active: { $ne: false } });
//   next();
// });

// userSchema.methods.populateFriends = function (Model) {
//   const newFriends = [];
//   this.friends.map((el) => {
//     newFriends.push(Model.find({ slug: el }));
//   });
//   this.friends = newFriends;
// };

userSchema.methods.countPosts = function (countBy) {
  this.postAmount = countBy.length;
};

userSchema.methods.checkPassword = async function (
  passedPassword,
  userPassword
) {
  return await bcrypt.compare(passedPassword, userPassword);
};

userSchema.methods.changePassAfter = function (timeStamp) {
  if (this.passwordChangeDate) {
    const changedTImeStamp = parseInt(
      this.passwordChangeDate.getTime() / 1000,
      10
    );
    return timeStamp < changedTImeStamp;
  }

  return false;
};

// userSchema.methods.sendFriendRequest = function (obj) {
//   this.friendRequests.push(obj);
// };

userSchema.pre("save", function (next) {
  this.slug = this.username.toLowerCase().split(" ").join("-");
  next();
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  this.passwordChangeDate = Date.now();
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
