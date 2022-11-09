let mongoose = require("mongoose");

mongoose
  .connect("mongodb://localhost:27017/Ecommerce")
  .then(() => console.log("Connected to mongoDB"))
  .catch((err) => console.log(err.message));

module.exports = mongoose;
