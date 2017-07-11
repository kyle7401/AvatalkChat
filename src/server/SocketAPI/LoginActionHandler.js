var _ = require('lodash');
var Observer = require("node-observer");

var UsersManager = require("../lib/UsersManager");
var DatabaseManager = require("../lib/DatabaseManager");
var Utils = require("../lib/Utils");
var Const = require("../const");
var SocketHandlerBase = require("./SocketHandlerBase");
var UserModel = require("../Models/UserModel");
var Settings = require("../lib/Settings");

var LoginActionHandler = function () {

}

_.extend(LoginActionHandler.prototype, SocketHandlerBase.prototype);

LoginActionHandler.prototype.attach = function (io, socket) {

    var self = this;

    /**
     * @api {socket} "login" Login to the room
     * @apiName Login to room
     * @apiGroup Socket
     * @apiDescription Login to room
     * @apiParam {string} roomID Room ID
     *
     */
    socket.on('login', function (param) {

        if (Utils.isEmpty(param.userID)) {
            socket.emit('socketerror', {code: Const.resCodeSocketLoginNoUserID});
            return;
        }

        if (Utils.isEmpty(param.roomID)) {
            socket.emit('socketerror', {code: Const.resCodeSocketLoginNoRoomID});
            return;
        }

        socket.join(param.roomID);
        io.of(Settings.options.socketNameSpace).in(param.roomID).emit('newUser', param);
        Observer.send(this, Const.notificationNewUser, param);

        //save as message
        UserModel.findUserbyId(param.userID, function (err, user) {
            var ifExists = false;

            if (_.isEmpty(user)) {
            }

            // TODO : 채팅방에 이미 존재하는 사용자인지 확인 필요
            try {
                var chatUser = UsersManager.getUserById(param.userID, param.roomID);

                if (chatUser) {
                    console.log(param.userID, ' 채팅방에 존재', chatUser);
                    ifExists = true;
                }
            } catch (ex) {
                console.log('채팅방 사용자 확인 에러', ex);
                return;
            }

            // 2016-12-27일 TypeError: Cannot read property 'name' of null 에러 발생
            try {
                UsersManager.addUser(param.userID, user.name, user.avatarURL, param.roomID, user.token);
                UsersManager.pairSocketIDandUserID(param.userID, socket.id);
            } catch (ex) {
                console.log('채팅방 사용자 추가 에러', ex);
                return;
            }

            // TODO : 채팅방에 존재하지 않는 사용자면 입장 메세지 표시
            // if (Settings.options.sendAttendanceMessage) {
            if (param.roomID != 1 && !ifExists) { // 채팅방을 선택해 주세요 화면에 입장 메세지가 표시된다.

                // save to database
                var newMessage = new DatabaseManager.messageModel({
                    user: user._id,
                    userID: param.userID,
                    roomID: param.roomID,
                    message: '',
                    type: Const.messageNewUser,
                    created: Utils.now()
                });

                newMessage.save(function (err, message) {
                    if (err) {
                        socket.emit('socketerror', {code: Const.resCodeSocketUnknownError});
                        return;
                    }

                    var messageObj = message.toObject();
                    messageObj.user = user.toObject();

                    io.of(Settings.options.socketNameSpace).in(param.roomID).emit('newMessage', messageObj);
                });

            }

        });

    });

}


module["exports"] = new LoginActionHandler();