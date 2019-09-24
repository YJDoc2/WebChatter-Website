const express = require('express');
const router = express.Router();

const User = require('../models/user');
const Chat = require('../models/chat');

router.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect('/home');
  } else {
    res.render('login');
  }
});

router.get('/home', ensureAuthenticated, (req, res) => {
  //console.log(req.user);
  //console.log(req.session);
  Chat.find({ uuid: { $in: req.user.chatsUuid } })
    .sort({ lastUpdate: -1 })
    .exec((err, docs) => {
      if (err) {
        console.log(err);
        return;
      }
      res.render('home', { username: req.user.userName, chats: docs });
    });
});

router.get('/newchat/:uuid', ensureAuthenticated, (req, res) => {
  User.findOne({ uuid: req.params.uuid }, (err, otherUser) => {
    if (err) {
      console.log(err);
      res.redirect('/home');
    }
    if (otherUser) {
      if (req.user.chatsUName.includes(otherUser.userName)) {
        res.redirect('/home');
      } else {
        res.render('newChat', {
          username: req.user.userName,
          otherUser: otherUser
        });
      }
    }
  });
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    //eq.flash('danger', 'Please login');
    res.redirect('/notLoggedIn.html');
  }
}

module.exports = router;
