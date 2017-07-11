var Backbone = require('backbone');
var _ = require('lodash');
var socket = require('socket.io-client');

var U = require('../../../libs/utils.js');
var LoginUserManager = require('../../../libs/loginUserManager.js');
var socketIOManager = require('../../../libs/socketIOManager');
var UrlGenerator = require('../../../libs/urlGenerator');
var WebAPIManager = require('../../../libs/webAPIManager');
var CONST = require('../../../consts');
var ProcessingDialog = require('../../Modals/ProcessingDialog/ProcessingDialog');
var User = require('../../../Models/user.js');
var Settings = require('../../../libs/Settings');
var Cookies = require('js-cookie');
var Const = require('../../../consts.js');

var template = require('./Sidebar.hbs');

var SidebarView = Backbone.View.extend({

    el: null,
    // usersCollection: null,
    roomCollection: null, // 추가
    // userTemplate: null,
    roomTemplate: null, // 추가
    lastMessages: {},
    initialize: function (options) {
        this.el = options.el;
        this.render();

        // http://stackoverflow.com/questions/15861203/how-to-use-the-backbone-view-events-definition-to-listen-for-custom-subview-ev
        this.parent = options.parent;
    },

    render: function () {
        $(this.el).html(template());
        this.onLoad();
        return this;

    },

    onLoad: function () {

        // this.userTemplate = require('./cellUser.hbs');
        this.roomTemplate = require('./cellRoom.hbs');

        // this.refreshUsers();
        // 로그인한 사용자의 채팅방 목록
        this.refreshRooms();

        var self = this;

        Backbone.on(CONST.EVENT_ON_MESSAGE, function (obj) {

            if (_.isEmpty(obj))
                return;

            if (_.isEmpty(obj.user))
                return;

            var userID = obj.user.userID;
            var userIDEscapted = encodeURIComponent(userID).replace("'", "quote").replace("%", "");
// alert(userID +' @ '+ userIDEscapted);

            if (obj.type == CONST.MESSAGE_TYPE_TEXT) {
                self.lastMessages[userID] = obj.message;
                SS("#online-users #" + userIDEscapted + " p").text(obj.message);
            }
        });

        Backbone.on(CONST.EVENT_ON_TYPING, function (obj) {


            if (_.isEmpty(obj))
                return;

            if (_.isEmpty(obj.userID))
                return;

            var userID = obj.userID;
            var userIDEscapted = encodeURIComponent(obj.userID).replace("'", "quote").replace("%", "");


            if (obj.type == CONST.TYPING_ON) {

                // SS("#online-users #" + userIDEscapted + " p").text("Typing...");
                SS("#online-users #" + userIDEscapted + " p").text("입력중...");

            } else {

                if (!_.isEmpty(self.lastMessages[userID])) {
                    SS("#online-users #" + userIDEscapted + " p").text(self.lastMessages[userID]);
                } else {
                    SS("#online-users #" + userIDEscapted + " p").text("");
                }

            }

        });


        // New user login
        Backbone.on(CONST.EVENT_ON_LOGIN_NOTIFY, function (obj) {

            self.refreshUsers();

            /*
             var userData = {"avatarURL" : obj.avatar, "name" : obj.name};

             if(obj.room == LoginUserManager.roomID){
             $('#online').append(userTemplate(userData));
             }
             */

        });

        Backbone.on(CONST.EVENT_ON_LOGOUT_NOTIFY, function (obj) {

            self.refreshUsers();

            /*
             var userData = {"avatarURL" : obj.avatar, "name" : obj.name};

             if(obj.room == LoginUserManager.roomID){
             $('#online').append(userTemplate(userData));
             }
             */

        });


        /*
         // Closing or refreshing window
         window.onbeforeunload = function() {

         socketIOManager.emit('logout', {
         id: LoginUserManager.user.get('id'),
         name: LoginUserManager.user.get('name'),
         room: LoginUserManager.roomID
         });

         };
         */

        _.debounce(function () {
            self.adjustSize();
        }, 100)();

        $(window).resize(function () {
            self.adjustSize();
        });
    },

    adjustSize: function () {
        var userListAreaHeight = SS('#sidebar').height() - SS('#sidebar .col-header').height();

        if (Settings.options.showTitlebar == false) {
            userListAreaHeight = SS('#sidebar').height();
        }

        SS('#online-users').height(userListAreaHeight);
    },

    // 사용자목록대신 방 목록으로 변경함에 따라 아무런 처리 하지 않음
    refreshUsers: function () {

        return true;

        var self = this;

        WebAPIManager.get(
            UrlGenerator.userList(LoginUserManager.roomID),

            // success
            function (data) {

                self.usersCollection = User.collectionByResult(data);

                SS('#online-users').empty();

                self.usersCollection.each(function (model, index) {
                    //U.l(model.attributes);
                    var obj = model.attributes;
                    obj.userIDEscapted = encodeURIComponent(obj.id).replace("'", "quote").replace("%", "");

                    console.log('refreshUsers\n'+ obj);

                    SS('#online-users').append(self.userTemplate(obj));
                });

                // hide processing which appears before login
                ProcessingDialog.hide();

            },

            //error
            function (error) {
                console.log('refreshUsers Error\n'+ error);
            }
        );

    },

    // 로그인한 사용자의 채팅방 목록
    refreshRooms: function () {
        var self = this;
        var loginInfo = Cookies.getJSON(Const.COOKIE_KEY_LOGININFO);
        // alert('refreshRooms = '+ loginInfo.id);

        WebAPIManager.get2(
            // UrlGenerator.userList(LoginUserManager.roomID),
            UrlGenerator.roomList(loginInfo.id),

            // success
            function (data) {
                // self.roomCollection = User.collectionByResult(data);
                self.roomCollection = data;

                SS('#online-users').empty();

                self.roomCollection.forEach(function (model, index) {
                    switch (model.division) {
                        case 1:
                            model.avatarURL = Settings.options.adminBaseUrl + model.profile;
                            break;

                        case 2:
                            model.avatarURL = 'img/chat_default_photo2.png';
                            break;

                        case 3:
                            model.avatarURL = 'img/chat_default_photo1.png';
                            break;
                    }

                    SS('#online-users').append(self.roomTemplate(model));
                });

                // hide processing which appears before login
                ProcessingDialog.hide();
            },

            //error
            function (error) {
                console.log('refreshRooms Error\n'+ error);
            }
        );

    },

    // https://lostechies.com/derickbailey/2011/10/11/backbone-js-getting-the-model-for-a-clicked-element/
    tagName: "ul",
    events: {
        "click li": "clicked"
    },

    clicked: function (e) {
        e.preventDefault();
        // debugger;
        var id = $(e.currentTarget).data("id");
        var title = $(e.currentTarget).data("title");
        var profile = $(e.currentTarget).data("profile");
        var moderators = $(e.currentTarget).data("moderators");
        var division = $(e.currentTarget).data("division");
        /*var item = this.roomCollection.get(id);
         var title = item.get("title");*/
        // alert(id +'@'+ title +'@'+ profile);

        LoginUserManager.roomID = id;
        // this.trigger('clicked2');
        this.parent.trigger('chatroom_change');
        // this.changeRoom();

        $("#room_name").html(title);
        $('#btn-room-setting').data('id', id);
        $('#btn-room-setting').data('title', title);
        $('#btn-room-setting').data('profile', profile);
        $('#btn-room-setting').data('moderators', moderators);
        $('#btn-room-setting').data('division', division);
        $('#btn-room-setting').show();
        // alert($('#btn-room-setting').data('id'));
    }

    /*, changeRoom: function () {
        this.trigger('clicked2');
        // this.parent.trigger('clicked2');
    }*/
});

module.exports = SidebarView;
