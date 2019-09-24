const express = require('express');
const router = express.Router();

const User = require('../models/user');
const Chat = require('../models/chat');

//Adding A New Chat

router.post('/newchat', ensureAuthenticated, (req, res) => {
  // let update = { $push: { chats: req.body.chatid } };
  User.update(
    { uuid: req.body.userSelf },
    {
      $push: { chatsUuid: req.body.chatid, chatsUName: req.user.userName }
    }
  );
  User.update(
    { uuid: req.body.userOther },
    {
      $push: { chatsUuid: req.body.chatid, chatsUName: req.body.otherUserName }
    }
  );

  res.sendStatus(201);
});

//Adding messages to chat
router.post('/chatAddMsg', ensureAuthenticated, (req, res) => {
  Chat.update(
    { uuid: req.body.id },
    {
      $push: { msgs: { text: req.body.msg, sender: req.user.userName } },
      $set: { lastUpdate: Date.now(), lastSender: req.user.userName },
      $inc: { unreadMsg: 1 }
    },
    (err, affected) => {
      if (err) {
        console.log(err);
        res.json({ success: false });
        return;
      }
      if (affected == 0) {
        res.json({ success: false });
      } else {
        res.json({ success: true });
      }
    }
  );
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    //eq.flash('danger', 'Please login');
    res.status(401).send('notLoggedIn');
  }
}
module.exports = router;
