const express = require('express');
const router = express.Router();

const User = require('../models/user');
const Chat = require('../models/chat');

router.get('/:uuid', ensureAuthenticated, (req, res) => {
  let userChats = req.user.chatsUuid;
  let chatid = req.params.uuid;

  if (!userChats.includes(chatid)) {
    res.sendStatus(404);
  } else {
    Chat.findOne({ uuid: chatid }, (err, chat) => {
      if (err) {
        console.log(err);
        res.redirect('/home');
      }
      if (chat) {
        let query = {};
        let chatName =
          chat.usersUName[0] === req.user.userName
            ? chat.usersUName[1]
            : chat.usersUName[0];
        if (chat.lastSender !== req.user.userName) {
          query = { $set: { unreadMsg: 0 } };
        }
        Chat.updateOne({ uuid: chatid }, query, (err, raw) => {
          if (err) {
            console.log(err);
            res.redirect('/home');
          }
          let chatName =
            chat.usersUName[0] === req.user.userName
              ? chat.usersUName[1]
              : chat.usersUName[0];
          res.render('chat', {
            username: req.user.userName,
            chat: chat,
            chatName: chatName
          });
        });
      }
    });
  }
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
