const cookieParser = require("cookie-parser");
let express = require("express");
let { body, validationResult } = require("express-validator");
let mongoose = require("./database");
const { asyncErrors, validateBody } = require("./middlewares/asyncErrors");
const { isAuthenticated } = require("./middlewares/isAuthenticated");
const User = require("./model/users");
let crypto = require("crypto");
let cors = require("cors");
const cookieSession = require("cookie-session");
// let cookieSession = require("cookie-session");

let app = express();
app.set("trust proxy", true);
app.use(express.json());
app.use(cookieParser());
app.use(function (req, res, next) {
  // Website you wish to allow to connect
  console.log("hey");
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:4200");

  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", true);

  // Pass to next layer of middleware
  next();
});

//access-co

// app.use(cookieSession({ signed: false, secure: false }));

// app.use((req, resp, next) => {
//   next();
// }, cors({ maxAge: 84600 }));

// app.use(function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Credentials", true);
//   res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin,X-Requested-With,Content-Type,Accept,content-type,application/json"
//   );
//   next();
// });

// app.use(
//   cors.apply({
//     origin: "http://localhost:3000",
//     credentials: true,
//   })
// );
// app.use(
//   cookieSession({
//     signed: false,
//     secure: false,
//   })
// );

app.get("/", async (req, res, next) => {
  let users = await User.find();
  console.log(req.user);
  res.status(200).send(users);
});

app.post(
  "/",
  [
    body("name").not().isEmpty().withMessage("name is required"),
    body("age").not().isEmpty().withMessage("age is required"),
    body("email").not().isEmpty().withMessage("email is required"),
    body("email").isEmail().withMessage("email is not valid"),
    body("password").not().isEmpty().withMessage("password is required"),
  ],
  asyncErrors(async (req, res, next) => {
    // let errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //   let err_arr = [];
    //   errors.errors.forEach((element) => {
    //     err_arr.push(element.msg);
    //   });
    //   console.log(err_arr);
    //   return next(new Error(err_arr.join(",")));
    // }
    let error = validateBody(req);
    if (error != undefined) {
      return next(new Error(error));
    }
    let verifyEmail = await User.find({ email: req.body.email });
    console.log(verifyEmail);
    if (verifyEmail.length != 0) {
      return next(new Error("email already present in database"));
    }
    let newUser = new User({
      ...req.body,
    });
    let user = await newUser.save();
    let token = user.getToken();
    console.log(token);
    req.session.jwt = token;
    res
      .cookie("token", token, {
        httpOnly: false,
        maxAge: 1000 * 60 * 60 * 24 * 3,
        secure: true,
        // path: "*",
        sameSite: "None",
      })
      .status(200)
      .send({ success: true, token });
  })
);

app.post(
  "/forgetPassword",
  [body("email").not().isEmpty(), body("email").isEmail()],
  asyncErrors(async (req, res, next) => {
    let error = validateBody(req);
    if (error != undefined) {
      return next(new Error(error));
    }
    let user = await User.findOne({ email: req.body.email });
    if (!user) {
      return next(new Error("no record with such email"));
    }
    console.log(user);
    console.log(user.name);
    let rt = user.tokenResetPass();
    console.log(rt);
    res.send({ success: true, url: `http://localhost:3000/resetPass/${rt}` });
  })
);
app.get("/logout", isAuthenticated, (req, res, next) => {
  res
    .cookie("token", null, { httpOnly: false, expires: new Date(Date.now()) })
    .send("logout...");
});

app.post(
  "/login",
  asyncErrors(async (req, res, next) => {
    let { name, email } = req.body;
    // console.log(name);
    // console.log(email);
    let user = await User.findOne({ name, email });
    console.log(user);
    if (!user) {
      return next(new Error("User not found"));
    }
    let token = user.getToken();
    // console.log(token);
    // req.session.jwt = token;
    // console.log("Login = req.session.jwt");
    // console.log(req.session.jwt);
    res.cookie("token", token, {
      secure: true,
      // path: "*",
      sameSite: "None",
    });

    res.status(200).json(token);
  })
);
app.post("/rand", (req, res) => {
  res.send("success");
});
app.put("/resetPass/:token", async (req, res, next) => {
  let hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  let user = await User.find({ resetToken: hashedToken });
  if (!user) {
    return next(new Error("user not found or expiry time exceeded"));
  }
  if (req.body.password !== req.body.confirmPassword) {
    return next(new Error("passwords not matching"));
  }
  user.password = req.body.password;
  res.status(200).send("pass successfully changed");
});
app.get(
  "/current",
  isAuthenticated,
  asyncErrors(async (req, res, next) => {
    if (!req.user) return res.status(400).send("not auth");
    console.log("ever called");
    res.status(200).json(req.user);
  })
);

app.use((err, req, res, next) => {
  res.status(400).send(err.message);
});

app.listen(3001, () => {
  console.log("listening on 3001");
});
