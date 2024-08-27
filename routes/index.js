var express = require("express");
var router = express.Router();
const userModel = require("./users");
const postModel = require("./posts");
const passport = require("passport");
const upload = require("./multer");

const localStrategy = require("passport-local");
passport.use(new localStrategy(userModel.authenticate()));

router.get("/", function (req, res, next) {
  res.render("index");
});
router.get("/login", function (req, res) {
  res.render("login", { error: req.flash("error") });
});

router.get("/feed", async function (req, res, next) {
  try {
    const posts = await postModel.find({}).populate("user").exec(); // Fetch all posts
    res.render("feed", { posts }); // Pass posts to the template
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

router.post(
  "/upload",
  isLoggedIn,
  upload.single("file"),
  async function (req, res, next) {
    if (!req.file) {
      return res.status(404).send("No files were uploaded.");
    }
    const user = await userModel.findOne({
      username: req.session.passport.user,
    });

    const postdata = await postModel.create({
      image: req.file.filename, // Ensure this matches the multer configuration
      imageText: req.body.filecaption,
      user: user._id,
      description: req.body.description,
    });

    user.posts.push(postdata._id); // This was mistakenly written as 'post._id'
    await user.save();

    res.redirect("/profile");
  }
);

router.get("/profile", isLoggedIn, async function (req, res, next) {
  const user = await userModel
    .findOne({
      username: req.session.passport.user,
    })
    .populate("posts");
  res.render("profile", { user });
});
router.post(
  "/fileupload",
  isLoggedIn,
  upload.single("image"),
  async function (req, res, next) {
    const user = await userModel.findOne({
      username: req.session.passport.user,
    });
    user.dp = req.file.filename;
    await user.save();
    res.redirect("/profile");
  }
);
router.get("/add", isLoggedIn, async function (req, res, next) {
  const user = await userModel.findOne({
    username: req.session.passport.user,
  });
  res.render("add", { user });
});

router.post("/register", function (req, res, next) {
  const { username, email, fullname } = req.body;
  const userData = new userModel({ username, email, fullname });

  userModel.register(userData, req.body.password).then(function () {
    passport.authenticate("local")(req, res, function () {
      res.redirect("/profile");
    });
  });
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/login",
    failureFlash: true,
  }),
  function (req, res) {}
);

router.get("/logout", function (req, res) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

module.exports = router;
