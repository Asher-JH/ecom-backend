const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// new code {
const { body, validationResult } = require("express-validator");
// }

// REGISTER
router.post(
  "/register",

  // new code {
  body("email").isEmail(),
  body("password").isLength({ min: 6 }),
  // }

  (req, res) => {
    const { name, email, password } = req.body;

    // new code {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // }

    User.findOne({ email: email }, (err, user) => {
      if (user) {
        return res.status(400).json({ message: "User already exists" });
      } else {
        let user = new User();
        user.name = name;
        user.email = email;
        user.isAdmin = false;

        // Hash the password
        let salt = bcrypt.genSaltSync(10);
        let hash = bcrypt.hashSync(password, salt);
        user.password = hash;
        user.save();

        let payload = {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,

            // new line
            isAdmin: user.isAdmin,
          },
        };

        jwt.sign(payload, "mysecretkey", { expiresIn: "3h" }, (err, token) => {
          if (err) return res.status(400).json({ err });
          return res.json({
            token: token,
            user: user.id,
            isAdmin: user.isAdmin
          });
        });
      }
    });
  }
);

// LOGIN
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  User.findOne({ email }, (err, user) => {
    if (!user)
      return res.status(400).json({ message: "User does not exist my friend" });

    if (err) return res.status(400).json(err);

    let isMatch = bcrypt.compareSync(password, user.password);

    if (!isMatch)
      return res
        .status(400)
        .json({ message: "Credentials are incorrect my friend" });

    let payload = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,

        // new line
        isAdmin: user.isAdmin,
      },
    };

    jwt.sign(payload, "mysecretkey", { expiresIn: "3h" }, (err, token) => {
      if (err) return res.status(400).json({ err });
      return res.json({ token, user: user.id, isAdmin: user.isAdmin });
    });
  });
});

module.exports = router;
