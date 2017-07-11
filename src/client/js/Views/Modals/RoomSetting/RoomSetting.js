var $ = require('jquery');
var _ = require('lodash');
var U = require('../../../libs/utils.js');
var template = require('./RoomSetting.hbs');
var Settings = require('../../../libs/Settings');
var Cookies = require('js-cookie');
var Const = require('../../../consts.js');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');

var LoginUserManager = require('../../../libs/loginUserManager.js');
var Cookies = require('js-cookie');
var Const = require('../../../consts.js');
var LocalizationManager = require('../../../libs/localizationManager.js');

var NewGrpDialog = {

    room_id: null,
    title: null,
    profile: null,
    moderators: null,
    parent: null,
    userTemplate: null,

    show: function (id, title, profile, moderators, division, parent, text, onRetry) {

        var self = this;

        self.room_id = id;
        self.title = title;
        self.profile = profile;
        self.moderators = moderators;
        self.parent = parent;

        $('body').append(template({
            avatarURL: profile,
            name: title/*,
            condition: LoginUserManager.user.get('condition')*/
        }));

        $('#modal1').on('hidden.bs.modal', function (e) {
            $('#modal1').remove();
        });

        $('#modal1').modal('show');

        $('#modal-btn-close').on('click', function () {
            self.hide();
        });

        if (_.isUndefined(onRetry)) {
            $('#modal-btn-retry').hide();
        } else {
            $('#modal-btn-retry').on('click', function () {
                if (!_.isUndefined(onRetry))
                    onRetry();
            });
        }

        // 1:1 대화방은 초대불가
        if(division == 1) {
            $('#modal-invite').hide();
        } else {
            $('#modal-invite').show();
        }

        // 대화상대 초대
        $('#modal-invite').on('click', function () {
            $('#divBody1').hide();
            $('#divBody2').show();
        });

        // 대화방 나가기
        $('#modal-exit').on('click', function () {
            parent.exitRoom(self.room_id);
            self.hide();
        });

        // 대화방 해체
        var member_id = LoginUserManager.user.get('id');
        if (self.moderators == member_id) {
            $('#modal-delete').show();
            $('#modal-delete').on('click', function () {
                parent.deleteRoom(self.room_id);
                self.hide();
            });
        }

        // 대화방 사용자 목록
        this.userTemplate = require('./cellUser.hbs');
        self.refreshUsers();

        // 로그인한 사용자의 사용자 목록
        self.refreshFriends();
    },
    hide: function (onFinish) {

        $('#modal1').on('hidden.bs.modal', function (e) {

            $('#modal1').remove();

            if (!_.isUndefined(onFinish)) {
                onFinish();
            }

        })

        $('#modal1').modal('hide');
    },

    // 대화방 사용자 목록
    refreshUsers: function () {
        var self = this;
// alert('refreshUsers');
        Backbone.ajax({
            type: "GET",
            url: Settings.options.adminBaseUrl + '/api/chat/memlist?room_id=' + self.room_id,
            dataType: 'json',
            contentType: "application/json; charset=UTF-8",
            // headers: header,
            success: function (data) {

                $('#room_users').empty();

                for(var i=0; i<data.length; i++) {
                    var model = data[i];

                    var member = {
                        id: model.id,
                        nick_name: model.nick_name,
                        avatarURL: Settings.options.adminBaseUrl + model.profile
                    };

                    $('#room_users').append(self.userTemplate(member));
                }

                // $('#span_user_count').html((data.length + 1) +'명');
                $('#span_user_count').html(data.length + LocalizationManager.localize('persons'));

                // 방장일 경우 강퇴 버튼 보이게
                var member_id = LoginUserManager.user.get('id');
                if (self.moderators == member_id) {
                    $('#room_users li.cell-user button').css('display', 'block');
                }

                //
                $('#room_users button').on('click', function() {
                    if (confirm(LocalizationManager.localize('Would you like to be kicked out of the chat room?')) == true){
                        var id = $(this).data('id');
                        // alert(id);

                        Backbone.ajax({
                            type: "PATCH",
                            url: Settings.options.adminBaseUrl + '/api/chat/goout',
                            dataType: 'json',
                            contentType: "application/json; charset=UTF-8",
                            data : JSON.stringify({"member_id": id, "room_id": self.room_id}),
                            success: function (data) {
                                // alert('refreshUsers');
                                self.refreshUsers();
                                self.parent.refreshRooms();
                            },
                            error: function (e) {
                                alert(e);
                            }
                        });
                    }
                });

            },
            error: function (e) {
                alert(e);
            }
            /*,
             statusCode: {
             500: function () {
             ErrorDialog.show('새 그룹 만들기', '사용자 목록 확인중 에러가 발생 하였습니다.');
             }
             }*/
        });
    },

    // 로그인한 사용자의 사용자 목록
    refreshFriends: function () {
        var self = this;
        var member_id = LoginUserManager.user.get('id');

        Backbone.ajax({
            type: "GET",
            url: Settings.options.adminBaseUrl + '/api/friend/list?member_id=' + member_id,
            dataType: 'json',
            contentType: "application/json; charset=UTF-8",
            // headers: header,
            success: function (data) {

                var members = [];

                for(var i=0; i<data.length; i++) {
                    var model = data[i];

                    if (model.member) {
                        var member = {
                            id: model.member.id,
                            nick_name: model.member.nick_name,
                            avatarURL: Settings.options.adminBaseUrl + model.member.profile
                        };

                        $('#friend_list').append(self.userTemplate(member));
                        // members.push(member);
                    }
                }

                // 사용자 클릭시 사용자 초대 -> 참여자 목록 갱신
                $('#friend_list li').on('click', function() {
                    var id = $(this).data('id');
                    var title = $(this).data('title');
                    /*alert(id +'@'+ title);
                    return;*/

                    if (confirm(title +'님을 대화방에 추가하시겠습니까?')) {
                        var chatRoom = {
                            "room_id": self.room_id,
                            "members": [id],
                            "member_id": member_id
                        };

                        Backbone.ajax({
                            type: "PATCH",
                            // method: 'PATCH',
                            url: Settings.options.adminBaseUrl + '/api/chat/addmem',
                            dataType: 'json',
                            data: JSON.stringify(chatRoom),
                            contentType: "application/json; charset=UTF-8",
                            // headers: header,
                            success: function (response) {
                                // var room_id = response.result;
                                // alert(room_id);

                                $('#divBody2').hide();
                                $('#divBody1').show();
                                self.refreshUsers();
                                /*$("#room_name").html(title);
                                 LoginUserManager.roomID = room_id;
                                 self.parent.trigger('chatroom_change');
                                 self.hide();*/
                            },
                            error: function (e) {
                                alert(e);
                            }
                        });
                    }
                });

                // 사용자 목록중 본인은 강퇴버튼 보이지 않도록
                $('#btn'+ member_id).hide();
            }/*,
             statusCode: {
             500: function () {
             ErrorDialog.show('새 그룹 만들기', '사용자 목록 확인중 에러가 발생 하였습니다.');
             }
             }*/
        });
    }
}

module.exports = NewGrpDialog;