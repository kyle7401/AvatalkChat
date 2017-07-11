'use strict';

var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var UsersManager = require("../lib/UsersManager");

var _ = require('lodash');
var SocketAPIHandler = require('../SocketAPI/SocketAPIHandler');
var Settings = require("../lib/Settings");

var UserModel = require("../Models/UserModel");
var DatabaseManager = require("../lib/DatabaseManager");
var Const = require("../const");
var Utils = require("../lib/Utils");
var util = require('util');
// var RequestHandlerBase = require("./RequestHandlerBase");
/*var bodyParser = require("body-parser");
 var path = require('path');

 var DatabaseManager = require("../lib/DatabaseManager");
 var Utils = require("../lib/Utils");
 var Const = require("../const");
 var async = require('async');
 var formidable = require('formidable');
 var fs = require('fs-extra');
 var path = require('path');
 var mime = require('mime');
 var UserModel = require("../Models/UserModel");
 var MessageModel = require("../Models/MessageModel");
 var tokenChecker = require('../lib/Auth');*/

// var ChattingRoomModel = require("../Models/ChattingRoomModel");

// var SocketHandlerBase = require("../SocketAPI/SocketHandlerBase");

router.post('/sendNewUserMessage', function (req, res, next) {
    // var userID = 233;
    // var roomID = 997;
    var roomID = req.body.roomID;
    var userID = req.body.member_id;
    var member_nm = req.body.member_nm;
    var nick_name = req.body.nick_name;

    // return res.sendStatus(200);

//save as message
    UserModel.findUserbyId(userID, function (err, user) {
        // var message = user.name +' 님이 님을 초대하였습니다.';
        var message = util.format('%s 님이 %s님을 초대하였습니다.', member_nm, nick_name);

        // save to database
        var newMessage = new DatabaseManager.messageModel({
            user: user._id,
            userID: user.userID,
            roomID: roomID,
            message: message,
            // type: Const.messageUserLeave,
            // type: Const.messageNewUser,
            type: Const.NewUser,
            created: Utils.now()
        });

        newMessage.save(function (err, message) {

            if (err) {
                // throw err;
                console.log('초대 에러', err);
            }

            var messageObj = message.toObject();
            messageObj.user = user.toObject();

            var io = SocketAPIHandler.io;
            io.of(Settings.options.socketNameSpace).in(roomID).emit('newMessage', messageObj);
            return res.sendStatus(200);
        });

    });

    // return res.sendStatus(200);
});

// 채팅방 나가기 버튼 눌렀을때 메세지 표시
router.post('/processingExit', function (req, res, next) {
    var member_id = req.query.member_id;
    var room_id = req.query.room_id;

    if (!member_id) return res.status(409).send({result: '회원 아이디를 입력해 주세요!'});
    if (!room_id) return res.status(409).send({result: '채팅방 아이디를 입력해 주세요!'});

    var user = UsersManager.getUserById(member_id, room_id);
    var io = SocketAPIHandler.io;

    if (!_.isNull(user)) {
        // http://stackoverflow.com/questions/24463447/socket-io-disconnect-client-by-id
        try {
            if (io.of(Settings.options.socketNameSpace).sockets[user.socketID].connected) {
                io.of(Settings.options.socketNameSpace).sockets[user.socketID].disconnect();
            }
        } catch (err) {
            console.log('나가기 처리시 connected 확인 에러!!!');
        }

        UsersManager.removeUser(room_id, user.userID);

        io.of(Settings.options.socketNameSpace).in(room_id).emit('userLeft', user);
        console.log('나가기 처리' + member_id + ' @ ' + room_id);
    }

    UserModel.findUserbyId(member_id, function (err, user) {
        // save to database
        var newMessage = new DatabaseManager.messageModel({
            user: user._id,
            userID: user.userID,
            roomID: room_id,
            message: '',
            type: Const.messageUserLeave,
            created: Utils.now()
        });

        newMessage.save(function (err, message) {
            if (err) throw err;

            var messageObj = message.toObject();
            messageObj.user = user.toObject();

            io.of(Settings.options.socketNameSpace).in(room_id).emit('newMessage', messageObj);
        });
    });

    return res.status(200).send(user);
});

router.post('/processingBanned', function (req, res, next) {
    var member_id = req.query.member_id;
    var room_id = req.query.room_id;
    var nick_name = req.query.nick_name;
    /*var member_id = req.body.member_id2;
     var room_id = req.body.room_id2;*/

    if (!member_id) return res.status(409).send({result: '회원 아이디를 입력해 주세요!'});
    if (!room_id) return res.status(409).send({result: '채팅방 아이디를 입력해 주세요!'});

    var user = UsersManager.getUserById(member_id, room_id);
    var io = SocketAPIHandler.io;

    if (!_.isNull(user)) {
        // console.log(io.of(Settings.options.socketNameSpace).sockets[user.socketID]);

        // http://stackoverflow.com/questions/24463447/socket-io-disconnect-client-by-id
        if (io.of(Settings.options.socketNameSpace).sockets[user.socketID].connected) {
            io.of(Settings.options.socketNameSpace).sockets[user.socketID].disconnect();
        }

        UsersManager.removeUser(room_id, user.userID);
        // socket.leave(room_id);
    }

    UserModel.findUserbyId(member_id, function (err, user) {
        // user가 null이면 안드로이드 app이 종료됨
        if(user) {
            io.of(Settings.options.socketNameSpace).in(room_id).emit('userLeft', user);
            console.log('강퇴 처리 사용자' + user);
        }
        console.log('강퇴 처리' + member_id + ' @ ' + room_id);

        var message = util.format('%s 님이 퇴장당하였습니다.', nick_name);

        // save to database : user가 null이면 에러 발생
        /*var newMessage = new DatabaseManager.messageModel({
         user: user._id,
         userID: user.userID,
         roomID: room_id,
         message: message,
         // type: Const.messageUserLeave,
         type: Const.messageNewUser,
         created: Utils.now()
         });*/

        var newMessage = new DatabaseManager.messageModel({
            user: '',
            userID: '',
            roomID: room_id,
            message: message,
            type: Const.messageUserLeave,
            // type: Const.messageNewUser,
            created: Utils.now()
        });

        var waitFor;

        if (user != null) {
            newMessage.user = user._id;
             newMessage.userID = user.userID;
            waitFor = Promise.resolve(user);
        } else {
            var userModel = DatabaseManager.userModel;

            // waitFor = userModel.find().limit(1).exec();
            // waitFor = userModel.findOne().exec();

            var newUser = new userModel({
                name: nick_name,
                userID: member_id,
                avatarURL: '',
                token: ''
            });

            waitFor = newUser.save();
        }

        waitFor.then(function (findResult) {

            // user가 null이면 안드로이드 app이 종료됨 : 아무사용자로 채움
            if(!user) {
                findResult.name = nick_name;
                console.log('user가 null이면 안드로이드 app이 종료됨 : 아무사용자로 채움', findResult);
                io.of(Settings.options.socketNameSpace).in(room_id).emit('userLeft', findResult);
            }

            newMessage.user = findResult._id;
            newMessage.userID = findResult.userID;

            newMessage.save(function (err, message) {

                if (err) {
                    // throw err;
                    console.log('강퇴 에러', err);
                    return res.sendStatus(500);
                }

                var messageObj = message.toObject();

                if(user != null) { // null 에러 발생
                    messageObj.user = user.toObject();
                } else {
                    messageObj.user = findResult.toObject();
                    // console.log('user가 null일 경우 임시 사용자', messageObj);
                }

                var io = SocketAPIHandler.io;
                io.of(Settings.options.socketNameSpace).in(room_id).emit('newMessage', messageObj);
                // return res.sendStatus(200);

                console.log('강퇴 메세지', newMessage);

                return res.status(200).send(findResult);
            });

        });

    });

    // return res.status(200).send(user);
    // return res.status(500).send({result: error.message});
});

// 회원 탈퇴시 사용자 id로 강퇴 처리
router.post('/processingBanned2', function (req, res, next) {
    var member_id = req.query.member_id;

    if (!member_id) return res.status(409).send({result: '회원 아이디를 입력해 주세요!'});

    var rooms = UsersManager.getRoomByUserID(member_id);

    if (rooms && rooms.length > 0) {
        for (var i = 0; i < rooms.length; i++) {
            var room_id = rooms[i];
            var user = UsersManager.getUserById(member_id, room_id);

            if (!_.isNull(user)) {
                var io = SocketAPIHandler.io;

                // console.log(io.of(Settings.options.socketNameSpace).sockets[user.socketID]);

                // http://stackoverflow.com/questions/24463447/socket-io-disconnect-client-by-id
                if (io.of(Settings.options.socketNameSpace).sockets[user.socketID].connected) {
                    io.of(Settings.options.socketNameSpace).sockets[user.socketID].disconnect();
                }

                UsersManager.removeUser(room_id, user.userID);
                // socket.leave(room_id);

                io.of(Settings.options.socketNameSpace).in(room_id).emit('userLeft', user);
                console.log('강퇴 처리' + member_id + ' @ ' + room_id);
            }
        }
    }

    return res.sendStatus(200);
    // return res.status(200).send(user);
    // return res.status(500).send({result: error.message});
});

module.exports = router;