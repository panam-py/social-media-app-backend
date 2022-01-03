const User = require("../models/userModel");
const common = require("./commonController");
const catchAsyncError = require("../utils/catchAsyncError");
const { success } = require("../utils/sucessRes");
const Post = require("../models/postModel");
const AppError = require("../utils/appError");

let users;

exports.getAllUsers = common.getAll(User, users, true);

exports.getUsersBySlug = catchAsyncError(async (req, res, next) => {
  const slugs = req.params.ids.split(",");
  users = [];

  await Promise.all(
    slugs.map(async (el) => {
      const user = await User.findOne({ slug: el });
      if (user) {
        users.push(user);
      }
    })
  );

  success(res, "200", users);
});

exports.getUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id).populate({
    path: "posts",
  });
  if (!user || user.active === false) {
    return next(new AppError("No document found with that id!", 404));
  }
  user.countPosts(user.posts);
  success(res, "200", user);
});

exports.getMe = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate({
    path: "posts",
  });
  if (!user) {
    return next(new AppError("User does not exist", 404));
  }
  user.countPosts(user.posts);
  success(res, "200", user);
});

exports.updateMe = catchAsyncError(async (req, res, next) => {
  let email, username;
  if (!req.body.email && !req.body.username) {
    return next(new AppError("Did not find any data that can be updated", 400));
  }
  if (!req.body.email) {
    username = req.body.username;
    email = req.user.email;
  }
  if (!req.body.username) {
    email = req.body.email;
    username = req.user.username;
  }
  if (req.body.email && req.body.username) {
    username = req.body.username;
    email = req.body.email;
  }

  const data = {
    email: email,
    username: username,
  };
  const updatedUser = await User.findByIdAndUpdate(req.user.id, data, {
    new: true,
    runValidators: true,
  });

  success(res, "200", updatedUser);
});

exports.deactivateMe = catchAsyncError(async (req, res, next) => {
  data = {
    active: false,
  };

  if (req.user.active === false) {
    return next(new AppError("Account not active!", 401));
  }

  const user = await User.findByIdAndUpdate(req.user.id, data, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return next(new AppError("User does not exist!", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Account successfully deactivated",
  });
});

exports.deleteMeForever = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new AppError("User does not exist", 404));
  }

  await User.findByIdAndDelete(user.id)
  success(res, "204");
});

exports.deleteUser = catchAsyncError(async (req, res, next) => {
  if (!(req.user.role === "admin")) {
    return next(
      new AppError("You do not have the rights to perform this action!", 401)
    );
  }

  await User.findByIdAndDelete(req.params.id);
  const userPosts = await Post.find({ user: req.params.id });

  await Promise.all(
    userPosts.map(async (el) => {
      await Post.findByIdAndDelete(el.id);
    })
  );

  success(res, "204");
});

exports.sendFriendRequest = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.friendId);

  if (!user) {
    return next(new AppError("No user found with that Id!", 404));
  }

  if (req.user.id === user.id) {
    return next(
      new AppError("You cannot send a friend request to yourself", 401)
    );
  }

  const truthArray = [];

  user.friends.map((el) => {
    if (el === req.user.slug) {
      truthArray.push(true);
    } else {
      truthArray.push(false);
    }
  });

  if (truthArray.includes(true)) {
    return next(new AppError("You are already friends with this user!", 401));
  }

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  toData = {
    fromUser: req.user.id,
    userSlug: req.user.slug,
    accepted: false,
    dateSent: Date.now(),
  };

  fromData = {
    toUser: user.id,
    userSlug: user.slug,
    accepted: false,
    dateRecieved: toData.dateSent,
  };

  const fromRequests = user.friendRequestsRecievedDetails;
  const toRequests = req.user.friendRequestsSentDetails;
  toRequests.push(fromData);
  // for (i = 0; i < requests.length; i++) {
  //   if (requests[i].id === req.user.id) {
  //     return failure(res, "401", "Friend request already sent to this user!");
  //   } else {
  //     requests.push(data);
  //   }
  // }

  fromRequests.map((el) => {
    if (el.fromUser === req.user.id) {
      toData = null;
      return next(
        new AppError("Friend request already sent to this user!", 401)
      );
    }
  });

  if (!(toData === null)) {
    fromRequests.push(toData);
  }

  await User.findByIdAndUpdate(req.params.friendId, {
    friendRequestsRecievedDetails: fromRequests,
  });

  await User.findByIdAndUpdate(req.user.id, {
    friendRequestsSentDetails: toRequests,
  });

  res.status(200).json({
    status: "success",
    message: "Request sent successfully!",
  });
});

exports.respondToFriendRequest = catchAsyncError(async (req, res, next) => {
  // const user = await User.findById(req.params.friendToAcceptId);
  let request, data;
  if (req.method === "DELETE") {
    requestToDelete = req.params.friendToRespondTo;

    friendRequestsRecieved = req.user.friendRequestsRecievedDetails;
    newFriendRequestsRecieved = [];

    truthArr = [];
    console.log("HERE");
    friendRequestsRecieved.map((el) => {
      if (el.fromUser === requestToDelete) {
        truthArr.push(true);
      } else {
        truthArr.push(false);
        newFriendRequestsRecieved.push(el);
      }
    });
    console.log("HERE!");

    console.log("HERE!!");
    if (!truthArr.includes(true)) {
      return next(new AppError("There is no request from that user!", 400));
    }

    await User.findByIdAndUpdate(req.user.id, {
      friendRequestsRecievedDetails: newFriendRequestsRecieved,
    });

    res.status(200).json({
      status: "success",
      message: "Friend request deleted successfully!",
    });
  } else if (req.method === "PATCH") {
    const user = await User.findById(req.params.friendToRespondTo);

    if (!user) {
      return next(new AppError("User does not exist", 404));
    }

    const truthArray = [];

    fromRequests = req.user.friendRequestsRecievedDetails;
    toRequests = user.friendRequestsSentDetails;

    fromRequests.map((el) => {
      if (el.fromUser === req.params.friendToRespondTo) {
        truthArray.push(true);
      } else {
        truthArray.push(false);
      }
    });

    if (!truthArray.includes(true)) {
      return next(
        new AppError("There is no request from the user provided", 401)
      );
    }

    newFromRequests = [];
    newToRequests = [];

    fromRequests.map((el) => {
      if (!(el.fromUser === req.params.friendToRespondTo)) {
        newFromRequests.push(el);
      }
    });

    toRequests.map((el) => {
      if (!(el.toUser === req.user.id)) {
        newToRequests.push(el);
      }
    });

    userFriends = req.user.friends;
    userFriends.push(user.slug);
    requesterFriends = user.friends;
    requesterFriends.push(req.user.slug);

    await User.findByIdAndUpdate(req.user.id, {
      friendRequestsRecievedDetails: newFromRequests,
      friends: userFriends,
    });

    await User.findByIdAndUpdate(user.id, {
      friendRequestsSentDetails: newToRequests,
      friends: requesterFriends,
    });

    res.status(200).json({
      status: "success",
      message: "Friend request Accepted successfully!",
    });
  }
});

// exports.getFriends = catchAsyncError(async (req, res, next) => {
//   console.log("Starting...");
//   const friends = req.user.friends;
//   const friendsArr = [];
//   await Promise.all(
//     friends.map(async (el) => {
//       const user = await User.find({ slug: el });
//       friendsArr.push(user);
//     })
//   );
//   if (!(friendsArr.length > 0)) {
//     return failure(res, "404", "This user has no friends!");
//   }

//   success(res, "200", friendsArr, results);
// });

exports.checkReports = catchAsyncError(async (req, res, next) => {
  const users = await User.find();
  Promise.all(
    users.map(async (el) => {
      if (el.reports >= 10) {
        await User.findByIdAndDelete(el.id);
      }
    })
  );
  next();
});

exports.report = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  reportedBy = user.reportedBy;

  const truthArr = [];

  reportedBy.map((el) => {
    if (el === req.user.slug) {
      truthArr.push(true);
    } else {
      truthArr.push(false);
    }
  });

  if (truthArr.includes(true)) {
    return next(
      new AppError("You have already reported this user in the past!", 401)
    );
  }

  if (!user) {
    return next(new AppError("User does not exist", 404));
  }

  reports = user.reports + 1;
  reportedBy.push(req.user.slug);

  await User.findByIdAndUpdate(req.params.id, {
    reports,
    reportedBy,
  });

  res.status(200).json({
    stats: "Success",
    message: "User reported successfully",
  });
});

exports.unFriend = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  const userFriends = req.user.friends;
  const userFriendRequestSent = req.user.friendRequestsSentDetails;
  const userFriendRequestsRecieved = req.user.friendRequestsRecievedDetails;
  newUserFriendRequestsSent = [];
  newUserFriendRequestsRecieved = [];
  newUserFriends = [];

  const otherUserFriends = user.friends;
  const otherUserFriendRequestSent = user.friendRequestsSentDetails;
  const otherUserFriendRequestsRecieved = user.friendRequestsRecievedDetails;
  newOtherUserFriendRequestSent = [];
  newOtherUserFriendRequestsRecieved = [];
  newOtherUserFriends = [];

  if (!user) {
    return next(new AppError("User does not exist", 404));
  }

  if (!otherUserFriends.includes(req.user.slug)) {
    return next(new AppError("This user is not friends with you", 401));
  }

  userFriends.map((el) => {
    if (!(el === user.slug)) {
      newUserFriends.push(el);
    }
  });

  userFriendRequestSent.map((el) => {
    if (!el.slug === user.slug) {
      newUserFriendRequestsSent.push(el);
    }
  });

  userFriendRequestsRecieved.map((el) => {
    if (!el.slug === user.slug) {
      newUserFriendRequestsRecieved.push(el);
    }
  });

  otherUserFriends.map((el) => {
    if (!(el === req.user.slug)) {
      newOtherUserFriends.push(el);
    }
  });

  otherUserFriendRequestSent.map((el) => {
    if (!el.slug === req.user.slug) {
      newOtherUserFriendRequestSent.push(el);
    }
  });

  otherUserFriendRequestsRecieved.map((el) => {
    if (!el.slug === req.user.slug) {
      newOtherUserFriendRequestsRecieved.push(el);
    }
  });

  await User.findByIdAndUpdate(req.user.id, {
    friends: newUserFriends,
    friendRequestsSentDetails: newUserFriendRequestsSent,
    friendRequestsRecievedDetails: newOtherUserFriendRequestsRecieved,
  });

  await User.findByIdAndUpdate(user.id, {
    friends: newOtherUserFriends,
    friendRequestsSentDetails: newOtherUserFriendRequestSent,
    friendRequestsRecievedDetails: newOtherUserFriendRequestsRecieved,
  });

  res.status(200).json({
    status: "Success",
    message: "User unfriended successfully",
  });
});
