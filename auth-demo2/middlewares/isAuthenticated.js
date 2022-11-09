let jwt = require("jsonwebtoken");
const User = require("../model/users");
const { asyncErrors } = require("./asyncErrors");

module.exports.isAuthenticated = asyncErrors(async (req, res, next) => {
  let token = req.cookies?.token;
  console.log(req.cookies);
  // console.log("isAuth = req.session.jwt");
  // const token = JSON.parse(req.session.jwt);
  // console.log("isAuth = parsed");
  // console.log(token);
  // console.log("isAuth = unparsed");
  // console.log(req.session.jwt);
  // console.log("isAuth = entire req.session");
  // console.log(req.session);
  if (!token) {
    return next(new Error("token not found"));
  }
  console.log("i am called");
  console.log(token);
  let decoded = jwt.verify(token, "ashdajksdhjkashdjbabsv");
  console.log(decoded);
  req.user = await User.findOne({ _id: decoded.id });
  next();
});
