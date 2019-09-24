const express = require("express");
const router = express.Router();
const User = require('../models/user');
const Chat = require('../models/chat');
const uuidv4 = require('uuid/v4');
/*router.get('/defaultChats', ensureAuthenticated, (req, res) => {

    let userid = req.session.user;
    User.findOne({ id: userid }, (err, user) => {
        res.render('./partials/chatbox', { chats: user.chats, users: false });
    })

});*/

router.get('/search/:reg', ensureAuthenticated, (req, res) => {

    let reg = req.params.reg;
    User.find({ userName: { $regex: reg, $options: "i" } }, (err, users) => {
        let usersExceptSelf = users.filter((user) => user.id !== req.user.id && !(req.user.chatsUName.includes(user.userName)));
        res.render('./partials/chatSearchRes', { users: usersExceptSelf });
    })
});

router.post('/createNewChat', ensureAuthenticated, (req, res) => {
    let chatid = uuidv4();
    let chat = new Chat({
        uuid: chatid,
        usersuuid: [req.user.uuid, req.body.otherUuid],
        usersUName: [req.user.userName, req.body.otherUserName],
        lastUpdate: Date.now(),
        unreadMsg: 1,
        lastSender: req.user.userName,
        msgs: [{
            text: req.body.msg,
            sender: req.user.userName
        }]

    });
    /* ADD ERROR HANDLING BY RESPONSE*/
    chat.save((err) => {
        if (err) {
            console.log(err);
            return;
        } else {

            chatid = chatid;
            let userSelf = req.user.uuid;
            let userOther = req.body.otherUuid
            let otherUserName = req.body.otherUserName;

            /*ADD ERROR HANDLING*/
            User.updateOne({ uuid: userSelf }, { $push: { chatsUuid: chatid, chatsUName: otherUserName } }, (err, raw) => {
                if (err) { console.log(err); return; }
                User.updateOne({ uuid: userOther }, { $push: { chatsUuid: chatid, chatsUName: req.user.userName } }, (err, raw) => {
                    if (err) { console.log(err); return; }
                    res.json({ link: `/chats/${chatid}` });
                    return;
                });
            });
        }
    });
});

router.get('/newChatQuery', ensureAuthenticated, (req, res) => {
    if (req.user.chatsUName.includes(req.query.uname)) {
        res.json({ link: `/home` });
    } else {
        res.json({ link: `/newchat/${req.query.id}` });
    }
})

router.get('/refreshHomeChats', ensureAuthenticated, (req, res) => {
    Chat.find({ uuid: { $in: req.user.chatsUuid } })
        .sort({ lastUpdate: -1 })
        .exec((err, docs) => {
            if (err) {
                console.log(err);
                return;
            }
            res.render('./partials/chatbox', { user: req.user.userName, chats: docs });
        });
});

router.get('/refreshChat/:id', ensureAuthenticated, (req, res) => {
    let chatid = req.params.id;
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
                res.render('./partials/chatHistory', {
                    chat: chat,
                    chatName: chatName
                });
            });
        }
    });
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.status(401).send('notLoggedIn');
    }
}

module.exports = router;