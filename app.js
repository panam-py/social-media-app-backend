const express = require("express");
const morgan = require("morgan");
const dotenv = require("dotenv");

const postRouter = require("./routes/postRoutes");
const commentRouter = require("./routes/commentRoutes");
const userRouter = require("./routes/userRoutes");
const apiUserRouter = require("./routes/apiUserRoutes");
const errorController = require("./controllers/errorController");

dotenv.config({ path: "./config.env" });

const app = express();

if (process.env.ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.json());

app.use("/api/v1/posts", postRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1", apiUserRouter);

app.use(errorController);

module.exports = app;
