const mongoose = require("mongoose");
const validator = require("validator");
const crypto = require("crypto");

const apiUserSchema = mongoose.Schema({
  email: {
    type: String,
    required: [true, "Every user must have an email address"],
    unique: [true, "Email already registered"],
    validate: validator.isEmail,
  },
  authKey: String,
});

// apiUserSchema.methods.createAuthKey = function () {
//   const key = crypto.randomBytes(32).toString("hex");

//   this.authKey = key;
// };

const APIUser = mongoose.model("APIUser", apiUserSchema);

module.exports = APIUser;
