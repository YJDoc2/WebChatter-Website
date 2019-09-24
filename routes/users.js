const express = require('express');
const router = express.Router();
const expressValidator = require('express-validator');
const passport = require('passport');
const uuidv4 = require('uuid/v4');
const bcrypt = require('bcryptjs');

const User = require('../models/user');

router.get('/home', (req, res) => {
  res.render('home');
});

router.post(
  '/register',
  [
    expressValidator
      .check('name')
      .not()
      .isEmpty()
      .withMessage('Name is required'),
    expressValidator
      .check('email')
      .not()
      .isEmpty()
      .withMessage('Email is required'),
    expressValidator
      .check('email')
      .isEmail()
      .withMessage('Email is not valid'),
    expressValidator
      .check('username')
      .not()
      .isEmpty()
      .withMessage('Username is required'),
    expressValidator
      .check('password')
      .not()
      .isEmpty()
      .withMessage('Password is required')
  ],
  (req, res) => {

    const username = req.body.username;
    const password = req.body.password;
    const password2 = req.body.password2;

    let errors = expressValidator.validationResult(req);
    if (!(password === password2)) {
      errors.errors.push({
        param: 'password2'
      });
    }
    if (errors.errors.length) {
      res.render('login', {
        errors: errors.errors
      });
      //console.log(errors);
    } else {

      User.countDocuments({ userName: username }, (err, count) => {
        if (count != 0) {
          res.render('login', { unameTaken: true });
        } else {
          createUser(req, res);
        }
      });
    }
  }
);


// Login Process
router.post('/login', function (req, res, next) {
  passport.authenticate('local', function (err, user, info) {
    if (err) { return next(err); }
    if (!user) {
      res.render('login', info);
      return;
    }
    req.logIn(user, function (err) {
      if (err) { return next(err); }
      return res.redirect(`/home`);
    });
  }
  )(req, res, next);
});



router.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});



function createUser(req, res) {

  const name = req.body.name;
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;

  let newUser = new User({
    uuid: uuidv4(),
    name: name,
    email: email,
    userName: username,
    password: password
  });
  bcrypt.genSalt(10, function (err, salt) {
    bcrypt.hash(newUser.password, salt, function (err, hash) {
      if (err) {
        console.log(err);
      }
      newUser.password = hash;
      newUser.save(function (err) {
        if (err) {
          console.log(err);
          return;
        } else {

          //console.log(`Saved User : ${newUser}`);
          res.render('login', { success: true });
        }
      });
    });
  });
}

module.exports = router;
