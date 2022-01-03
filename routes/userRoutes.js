const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

const router = express.Router();

// router.use(authController.checkAPIUser);
// router.use(userController.checkReports);

router.route("/").get(userController.getAllUsers);
router.post("/signup", authController.signUp);
router.post("/login", authController.logIn);

router.use(authController.protectRoutes);

router.get("/me/friends/:ids", userController.getUsersBySlug);

router
  .route("/me")
  .get(userController.getMe)
  .patch(userController.updateMe)
  .delete(userController.deactivateMe);
router
  .route("/:id")
  .get(userController.getUser)
  .delete(authController.restrict, userController.deleteUser);

router
  .route("/friendrequest/:friendId")
  .patch(userController.sendFriendRequest);

router
  .route("/respond/:friendToRespondTo")
  .patch(userController.respondToFriendRequest)
  .delete(userController.respondToFriendRequest);

// router.route("/friends").get(userController.getFriends);

router.patch("/report/:id", userController.report);

router.patch("/unfriend/:id", userController.unFriend);

router.delete(
  "/me/delete",

  userController.deleteMeForever
);

module.exports = router;
