const catchAsyncError = require("../utils/catchAsyncError");
const User = require("../models/userModel");
const { success } = require("../utils/sucessRes");
const AppError = require("../utils/appError");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const crypto = require("crypto");
const APIUser = require("../models/apiUserModel");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createAndSendToken = (res, statusCode, user) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.ENV === "production") cookieOptions.secure = true;
  res.cookie("jwt", token, cookieOptions);
  user.password = undefined;
  user.confirmPassword = undefined;
  user.passwordChangeDate = undefined;
  res.status(statusCode).json({
    status: "success",
    token: token,
    data: { user },
  });
};

exports.signUpAPIUser = catchAsyncError(async (req, res, next) => {
  const email = req.body.email;

  if (!email) {
    return next(new AppError("No email provided", 400));
  }

  const authKey = req.headers.apikey;
  if (authKey) {
    return next(
      new AppError(
        "API key already provided in header, please remove it to continue!",
        400
      )
    );
  }

  const newKey = crypto.randomBytes(32).toString("hex");

  const data = {
    email,
    authKey: newKey,
  };

  const newAPIUser = await APIUser.create(data);

  res.status(200).json({
    status: "success",
    message:
      "You are now a certified API User, Keep your API Key safe, it is like a password!",
    data: {
      newAPIUser,
    },
  });
});

exports.checkAPIUser = catchAsyncError(async (req, res, next) => {
  const authKey = req.headers.apikey;
  if (!authKey) {
    return next(new AppError("Please provide an API Key", 401));
  }

  const apiUser = await APIUser.findOne({ authKey });

  if (!apiUser) {
    return next(new AppError("Invalid API key provided", 401));
  }

  next();
});

exports.signUp = catchAsyncError(async (req, res, next) => {
  data = {
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  };

  const newUser = await User.create(data);
  createAndSendToken(res, "201", newUser);
});

exports.logIn = catchAsyncError(async (req, res, next) => {
  let user;
  let cred;
  if (req.body.username && !req.body.email) {
    cred = req.body.username;
    user = await User.findOne({ username: cred }).select("+password");
  } else if (req.body.email && !req.body.username) {
    cred = req.body.email;
    user = await User.findOne({ email: cred }).select("+password");
  }

  if (!cred || !req.body.password) {
    return next(
      new AppError("Please specify an email or username and a password!", 400)
    );
  }

  if (!user || !(await user.checkPassword(req.body.password, user.password))) {
    return next(new AppError("Incorrect username(email) or password", 400));
  }

  createAndSendToken(res, "200", user);
});

exports.protectRoutes = catchAsyncError(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  // } else if (req.cookies.token.length > 1) {
  //   token = req.cookies.token;
  // }

  if (!token) {
    return next(
      new AppError("You are not logged in, Please log in to get access!", 401)
    );
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(
      new AppError("User who owns login token no longer exists!", 401)
    );
  }

  if (user.changePassAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please log in again", 401)
    );
  }

  req.user = user;
  next();
});

exports.restrict = catchAsyncError(async (req, res, next) => {
  const role = req.user.role;

  if (!(role === 'admin')) {
    return next(
      new AppError("You are not authorized to perform this action!", 401)
    );
  }

  next();
});
