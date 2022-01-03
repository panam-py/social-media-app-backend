const mongoose = require("mongoose");
const fs = require("fs");
const Post = require("../models/postModel");

const posts = JSON.parse(fs.readFileSync("./posts.json", "utf-8"));

mongoose
  .connect("mongodb://localhost:27017/trello", {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB connection successful");
  })
  .catch((err) => console.log(err));

posts.map(async (el, i) => {
  await Post.create(el);
  console.log(`Post ${i} added`);
});
