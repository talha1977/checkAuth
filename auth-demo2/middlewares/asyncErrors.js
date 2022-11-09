let { validationResult } = require("express-validator");
function asyncErrors(route) {
  return (req, res, next) => {
    Promise.resolve(route(req, res, next)).catch(next);
  };
}

let validateBody = (req) => {
  let errors = validationResult(req);
  console.log("modulated");
  if (!errors.isEmpty()) {
    let err_arr = [];
    errors.errors.forEach((element) => {
      err_arr.push(element.msg);
    });
    console.log(err_arr);
    let err_str = err_arr.join(",");
    return err_str;
  }
  return undefined;
};

module.exports.asyncErrors = asyncErrors;
module.exports.validateBody = validateBody;
