let mongoose = require("mongoose");
let jwt = require("jsonwebtoken");
let bcrypt = require("bcrypt");
let crypto = require("crypto");

let userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "name is required"],
  },
  email: {
    type: String,
    required: [true, "email is required"],
  },
  age: {
    type: Number,
    required: [true, "age is required"],
  },
  password: {
    type: String,
    required: [true, "password is required"],
  },
  resetToken: String,
  resetTokenExpiry: Date,
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.tokenResetPass = () => {
  let resetToken = crypto.randomBytes(20).toString("hex");
  this.resetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  console.log(this.resetToken);
  this.resetTokenExpiry = 1 * 24 * 60 * 60;
  return resetToken;
};

userSchema.methods.getToken = function () {
  let token = jwt.sign({ id: this._id }, "ashdajksdhjkashdjbabsv", {
    expiresIn: "5d",
  });
  return token;
};

let User = mongoose.model("User2", userSchema);
module.exports = User;
