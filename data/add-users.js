const mongoose = require("mongoose");
const fs = require("fs");
const User = require("../models/userModel");

const users = JSON.parse(fs.readFileSync("./users.json", "utf-8"));

users.map((el) => {
  el.password = "test1234";
  el.username = el.name;
  el.confirmPassword = "test1234";
  if (el.email.includes("admin")) {
    el.role = "admin";
  } else {
    el.role = "user";
  }
});

mongoose
  .connect("mongodb://localhost:27017/trello", {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to Database"))
  .catch((err) => console.log(err));

users.map(async (el, i) => {
  await User.create(el);
  console.log(`User ${i + 1} added successfully`);
});
