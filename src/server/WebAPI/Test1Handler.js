var express = require('express');
var router = express.Router();
var bodyParser = require("body-parser");
var path = require('path');
var _ = require('lodash');

var RequestHandlerBase = require("./RequestHandlerBase");
var UsersManager = require("../lib/UsersManager");
var DatabaseManager = require("../lib/DatabaseManager");
var Utils = require("../lib/Utils");
var Const = require("../const");
var async = require('async');
var formidable = require('formidable');
var fs = require('fs-extra');
var path = require('path');
var mime = require('mime');
var SocketAPIHandler = require('../SocketAPI/SocketAPIHandler');
var UserModel = require("../Models/UserModel");
var MessageModel = require("../Models/MessageModel");
var tokenChecker = require('../lib/Auth');

var mongoose = require('mongoose');

var ChattingRoomModel = require("../Models/ChattingRoomModel");

var Test1Handler = function(){
    
}

_.extend(Test1Handler.prototype,RequestHandlerBase.prototype);

Test1Handler.prototype.attach = function(router){
        
    var self = this;

    /**
     * @api {get} /message/list/:roomID/:lastMessageID Get messages sent to room
     * @apiName Get messages of the room
     * @apiGroup WebAPI
     * @apiDescription Get last 50 message from the room

     * @apiParam {String} RoomID ID of room
     * @apiParam {String} lastMessageID MessageID of last message already shown. To get last 50 message put this param 0
     *
     * @apiSuccess {String} Token
     * @apiSuccess {String} User Model of loginned user
     *     
     * @apiSuccessExample Success-Response:
{

{
    "code": 1,
    "data": [
        {
            "__v": 0,
            "_id": "55d2d194caf997b543836fc8",
            "created": 1439879572232,
            "message": "",
            "roomID": "test",
            "type": 1001,
            "user": {
                "userID": "test",
                "name": "test",
                "avatarURL": "http://45.55.81.215:80/img/noavatar.png",
                "token": "UI6yHxeyZnXOZ1EgT6g5ftwD",
                "created": 1439878817506,
                "_id": "55d2cea1caf997b543836fb2",
                "__v": 0
            },
            "userID": "test",
            "seenBy": [
                {
                    "user": {
                        "userID": "test2",
                        "name": "test2",
                        "avatarURL": "http://45.55.81.215:80/img/noavatar.png",
                        "token": "YMsHeg3KEQIhtvt46W5fgnaf",
                        "created": 1439878824411,
                        "_id": "55d2cea8caf997b543836fb6",
                        "__v": 0
                    },
                    "at": 1439879572353
                },
                {
                    "user": {
                        "userID": "test3",
                        "name": "tset3",
                        "avatarURL": "http://45.55.81.215:80/img/noavatar.png",
                        "token": "TahnOaC6JzldCh6gAmJs3jMC",
                        "created": 1439878820142,
                        "_id": "55d2cea4caf997b543836fb4",
                        "__v": 0
                    },
                    "at": 1439879572361
                }
            ]
        },
        ...
    ]
}

    */

    // router.get('/:roomID/:lastMessageID', tokenChecker, function (request, response) {
    router.get('/:roomID/:lastMessageID', function (request, response) {

        var roomID = request.params.roomID;
        var lastMessageID = request.params.lastMessageID;

        if (Utils.isEmpty(roomID)) {

            self.successResponse(response, Const.resCodeMessageListNoRoomID);

            return;

        }

        async.waterfall([

                function (done) {

                    MessageModel.findMessages(roomID, lastMessageID, Const.pagingLimit, function (err, data) {

                        done(err, data);

                    });

                },
                function (messages, done) {

                    MessageModel.populateMessages(messages, function (err, data) {

                        done(err, data);

                    });

                }
            ],
            function (err, data) {

                if (err) {

                    self.errorResponse(
                        response,
                        Const.httpCodeSeverError
                    );

                } else {

                    self.successResponse(response, Const.responsecodeSucceed, {messages: data});

                }

            }
        );

    });

    // /chat/v1/test1/a
    router.get('/a', function (request, response) {

        response.send('Hello a');

    });

    // 대화방 나가기, 강퇴(Banned)를 위해서 사용자 id로 socket.id 검색
    // /chat/v1/test1/getSocketId
    router.patch('/getSocketId', function (req, res, next) {
        var member_id = req.body.member_id;
        var room_id = req.body.room_id;

        if (!member_id) return res.status(409).send({result: '회원 아이디를 입력해 주세요!'});
        if (!room_id) return res.status(409).send({result: '채팅방 아이디를 입력해 주세요!'});

        var user = UsersManager.getUserById(member_id, room_id);

        if(!_.isNull(user)){
            var SocketHandlerBase = require("../SocketAPI/SocketHandlerBase");
            var SocketAPIHandler = require('../SocketAPI/SocketAPIHandler');
            var Settings = require("../lib/Settings");

            var io = SocketAPIHandler.io;

            console.log(io.of(Settings.options.socketNameSpace).sockets[user.socketID]);

            // http://stackoverflow.com/questions/24463447/socket-io-disconnect-client-by-id
            if (io.of(Settings.options.socketNameSpace).sockets[user.socketID].connected) {
                io.of(Settings.options.socketNameSpace).sockets[user.socketID].disconnect();
            }

            UsersManager.removeUser(room_id, user.userID);
            // socket.leave(room_id);

            io.of(Settings.options.socketNameSpace).in(room_id).emit('userLeft', user);
        }

        return res.status(200).send(user);
        // return res.status(500).send({result: error.message});
    });

    // 사용자 목록 검색
    router.get('/Users', function (request, response, next) {

        var ObjectId = require('mongoose').Types.ObjectId;
        var query = UserModel.model.find().sort('userID');

        query.exec(function (error, results) {
            if(error) {
                return next(error);
            }

            response.json(results);
        });
    });

    // 대화방 생성
    router.get('/room/r/:id', function (request, response) {

        var _id = request.params.id;

        if (Utils.isEmpty(_id)) {
            // self.successResponse(response, Const.resCodeMessageListNoRoomID);
            self.successResponse(response, "_id !!!");
            return;
        }

/*        var aryId = new Array(_id);

        UserModel.findUsersbyInternalId(aryId, function (err, user) {

            if (user != null) {
                response.json(user);
            }

        });*/

        async.waterfall([

                function (done) {

                    /*MessageModel.findMessages(roomID, lastMessageID, Const.pagingLimit, function (err, data) {
                        done(err, data);
                    });*/

                    // 사용자 정보 검색
                    var aryId = new Array(_id);

                    UserModel.findUsersbyInternalId(aryId, function (err, user) {
                        done(err, user);
                    });

                },
                function (user, done) {

/*                    MessageModel.populateMessages(messages, function (err, data) {
                        done(err, data);
                    });*/

                    if (user != null) {
                        // 채팅방 생성
                        var objChatRoom = {
                            division: 1,
                            title: '1:1 대화방 #1',
                            // moderators: user,
                            moderators: user[0]._id,
                            members:[],
                            created: Utils.now()
                        };

                        // 방장
                        // objChatRoom.moderators = user;

                        // 채팅 참여자
                        // objChatRoom.members.push(user);

                        /*objChatRoom.addMember(user, function (err, chatRoomUpdated) {
                            // updatedMessages.push(chatRoomUpdated);
                            callback(err);
                        });*/

                        // objChatRoom.members.push(user);
                        objChatRoom.members.push(user[0]._id);

                        // response.json(user);
                        // response.json(objChatRoom);

                        // save to database
                        var newChatRoom = new DatabaseManager.chattingRoomModel(objChatRoom);

                        newChatRoom.save(function (err, chatroom) {

                            /*if (err) {
                                if (onError)
                                    onError(err);
                            }*/

                            done(err, chatroom);

                            // response.json(chatroom);

                            /*MessageModel.populateMessages(message, function (err, data) {

                                var messageObj = data[0];
                                messageObj.localID = '';
                                messageObj.deleted = 0;

                                if (!Utils.isEmpty(param.localID))
                                    messageObj.localID = param.localID;

                                SocketAPIHandler.io.of(Settings.options.socketNameSpace).in(param.roomID).emit('newMessage', data[0]);
                                Observer.send(this, Const.notificationSendMessage, data[0]);

                                if (onSucess)
                                    onSucess(message);

                            });*/

                        });
                    }

                }
            ],
            function (err, data) {

                if (err) {

                    self.errorResponse(
                        response,
                        Const.httpCodeSeverError
                    );

                } else {

                    self.successResponse(response, Const.responsecodeSucceed, {messages: data});

                }

            }
        );

    });

    router.post('/room/', function (request, response) {

        console.log('채팅방 생성');

        var param = request.body;

        var division = param.division;
        var title = param.title;
        var moderators = param.moderators;
        var members = param.members;

        if (Utils.isEmpty(division)) {
            self.errorResponse(response, '500', '채팅방 구분자(division)를 입력해 주세요!');
            return;
        }

        if (Utils.isEmpty(title)) {
            self.errorResponse(response, '500', '채팅방 제목(title)을 입력해 주세요!');
            return;
        }

        if (Utils.isEmpty(members)) {
            self.errorResponse(response, '500', '채팅 사용자(members)를 입력해 주세요!');
            return;
        }

        async.waterfall([

                function (done) {

                    // 채팅방 생성
                    var objChatRoom = {
                        division: 1,
                        title: '1:1 대화방 #1',
                        // moderators: user,
                        moderators: moderators,
                        members: moderators,
                        created: Utils.now()
                    };

                    // 채팅 참여자
                    // objChatRoom.members.push(user[0]._id);

                    // save to database
                    var newChatRoom = new DatabaseManager.chattingRoomModel(objChatRoom);

                    newChatRoom.save(function (err, chatroom) {

                        done(err, chatroom);

                    });

                }
            ],
            function (err, data) {

                if (err) {

                    self.errorResponse(
                        response,
                        Const.httpCodeSeverError
                    );

                } else {

                    self.successResponse(response, Const.responsecodeSucceed, {messages: data});

                }

            }
        );

    });

}

new Test1Handler().attach(router);
module["exports"] = router;
