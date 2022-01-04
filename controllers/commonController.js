const AppError = require("../utils/appError");
const catchAsyncError = require("../utils/catchAsyncError");
const { success } = require("../utils/sucessRes");

exports.getAll = (Model, docs, removeDisabled, options) =>
  catchAsyncError(async (req, res, next) => {
    if (options) {
      docs = await Model.find().populate(options);
    } else {
      docs = await Model.find();
    }
    const newDocs = [];
    if (removeDisabled) {
      docs.map((el) => {
        if (el.active === true) {
          newDocs.push(el);
        }
      });
      return success(res, "200", newDocs, true);
    }

    success(res, "200", docs, true);
  });

exports.createOne = (Model, doc, options) =>
  catchAsyncError(async (req, res, next) => {
    data = {};
    options.map((el) => {
      if (el === "user") {
        data[el] = req.user.id;
      } else if (el === 'post') {
        data[el] = req.body[el];
      }
    });
    doc = await Model.create(data);
    success(res, "201", doc);
  });

exports.updateOne = (Model, doc, options) =>
  catchAsyncError(async (req, res, next) => {
    data = {};
    options.map((el) => (data[el] = req.body[el]));
    doc = await Model.findById(req.params.id);

    if (!doc) {
      return next(new AppError("No document found with that id!", 404));
    }

    if (req.user.id == doc.user) {
      newDoc = doc.updateOne(data, {
        new: true,
        runValidators: true,
      });
    } else {
      return next(
        new AppError(
          "You are not authorized to update this document, since you are not the creator",
          401
        )
      );
    }
    success(res, "200", doc);
  });

exports.deleteOne = (Model, newDoc) =>
  catchAsyncError(async (req, res, next) => {
    doc = await Model.findById(req.params.id);

    if (!doc) {
      return next(new AppError("No document found with that id!", 404));
    }

    if (req.user.id == doc.user || req.user.role === "admin") {
      doc.deleteOne();
      return success(res, "204", doc);
    } else {
      return next(
        new AppError(
          "You are not authorized to delete this document as you are not the creator!",
          401
        )
      );
    }
  });

exports.likeOne = (Model, doc) =>
  catchAsyncError(async (req, res, next) => {
    doc = await Model.findById(req.params.id);

    if (!doc) {
      return next(new AppError("This document does not exist", 404));
    }

    docLikedBy = doc.likedBy;
    docDisLikedBy = doc.disLikedBy;
    docDislikes = doc.disLikes;
    newDocDislikedBy = [];

    if (docLikedBy.includes(req.user.slug)) {
      return next(
        new AppError("You have already liked this document in the past!", 401)
      );
    }

    if (docDisLikedBy.includes(req.user.slug)) {
      docDisLikedBy.map((el) => {
        if (!(req.user.slug === el)) {
          newDocDislikedBy.push(el);
        }
      });
      docDisLikedBy = newDocDislikedBy;
      docDislikes = doc.disLikes - 1;
    }

    docLikedBy.push(req.user.slug);
    docLikes = doc.likes + 1;

    await Model.findOneAndUpdate(req.params.id, {
      likes: docLikes,
      likedBy: docLikedBy,
      disLikes: docDislikes,
      disLikedBy: docDisLikedBy,
    });
    res.status(200).json({
      status: "success",
      message: "Liked successfully",
    });
  });

exports.disLikeOne = (Model, doc) =>
  catchAsyncError(async (req, res, next) => {
    doc = await Model.findById(req.params.id);

    if (!doc) {
      return next(new AppError("This document does not exist", 404));
    }

    docLikedBy = doc.likedBy;
    newDocLikedBy = [];
    docDisLikedBy = doc.disLikedBy;
    docLikes = doc.likes;

    if (docDisLikedBy.includes(req.user.slug)) {
      return next(
        new AppError(
          "You have already disliked this document in the past!",
          401
        )
      );
    }

    if (docLikedBy.includes(req.user.slug)) {
      docLikedBy.map((el) => {
        if (!(el === req.user.slug)) {
          newDocLikedBy.push(el);
        }
      });
      docLikedBy = newDocLikedBy;
      docLikes = doc.likes - 1;
    }

    console.log(doc.disLikes);

    docDisLikedBy.push(req.user.slug);
    docDisLikes = doc.disLikes + 1;

    await Model.findOneAndUpdate(req.params.id, {
      likes: docLikes,
      disLikes: docDisLikes,
      likedBy: docLikedBy,
      disLikedBy: docDisLikedBy,
    });

    res.status(200).json({
      status: "success",
      message: "Disliked successfully",
    });
  });

exports.removeLike = (Model, doc) =>
  catchAsyncError(async (req, res, next) => {
    doc = await Model.findById(req.params.id);
    if (!doc) {
      return next(new AppError("This document does not exist", 404));
    }

    docLikes = doc.likes;
    docLikedBy = doc.likedBy;
    newDocLikedBy = [];

    if (docLikedBy.includes(req.user.slug)) {
      docLikedBy.map((el) => {
        if (!(el === req.user.slug)) {
          newDocLikedBy.push(el);
        }
      });
      docLikedBy = newDocLikedBy;
      docLikes = doc.likes - 1;

      await Model.findOneAndUpdate(req.params.id, {
        likes: docLikes,
        likedBy: docLikedBy,
      });

      return res.status(200).json({
        status: "success",
        message: "Liked removed successfully",
      });
    } else {
      return next(
        new AppError("You did not like this document in the past", 401)
      );
    }
  });

exports.removeDisLike = (Model, doc) =>
  catchAsyncError(async (req, res, next) => {
    doc = await Model.findById(req.params.id);

    if (!doc) {
      return next(new AppError("This document does not exist", 404));
    }

    docDisLikes = doc.disLikes;
    docDisLikedBy = doc.disLikedBy;
    newDocDisLikedBy = [];

    if (docDisLikedBy.includes(req.user.slug)) {
      docDisLikedBy.map((el) => {
        if (!(el === req.user.slug)) {
          newDocDisLikedBy.push(el);
        }
      });
      docDisLikedBy = newDocDisLikedBy;
      docDisLikes = doc.disLikes - 1;

      await Model.findOneAndUpdate(req.params.id, {
        disLikes: docDisLikes,
        disLikedBy: docDisLikedBy,
      });

      return res.status(200).json({
        status: "success",
        message: "Dislike removed successfully",
      });
    } else {
      return next(
        new AppError("You did not dislike this document in the past", 404)
      );
    }
  });
