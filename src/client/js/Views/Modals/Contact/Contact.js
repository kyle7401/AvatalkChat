var $ = require('jquery');
var _ = require('lodash');
var U = require('../../../libs/utils.js');
var template = require('./Contact.hbs');
var Settings = require('../../../libs/Settings');
var Cookies = require('js-cookie');
var Const = require('../../../consts.js');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var LoginUserManager = require('../../../libs/loginUserManager.js');

var NewGrpDialog = {

    parent: null,
    userTemplate: null,

    show: function (title, parent, text, onRetry) {

        var self = this;

        self.parent = parent;

        $('body').append(template(/*{
            title: title,
            text: text
        }*/));

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

        // 로그인한 사용자의 사용자 목록
        this.userTemplate = require('./cellUser.hbs');

        self.refreshUsers();
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

    // 로그인한 사용자의 사용자 목록
    refreshUsers: function () {
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

                        $('#users').append(self.userTemplate(member));
                        // members.push(member);
                    }
                }

                // 사용자 클릭시 1:1 대화방 생성 -> 채팅방 목록 갱신 -> 해당 채팅방 입장
                $('#users li').on('click', function() {
                    var id = $(this).data('id');
                    var title = $(this).data('title');
                    // alert(id);

                    var chatRoom = {
                        "division": "1",
                        "title": "",
                        "moderators": member_id,
                        "members": [member_id, id]
                    };

                    Backbone.ajax({
                        type: "POST",
                        // method: 'PATCH',
                        url: Settings.options.adminBaseUrl +'/api/chat/make',
                        dataType: 'json',
                        data : JSON.stringify(chatRoom),
                        contentType: "application/json; charset=UTF-8",
                        // headers: header,
                        success: function (response) {
                            var room_id = response.result;
                            // alert(room_id);

                            self.parent.refreshRooms();
                            $("#room_name").html(title);
                            LoginUserManager.roomID = room_id;
                            self.parent.trigger('chatroom_change');
                            self.hide();
                        },
                        error: function (e) {
                            alert(e);
                        }
                        /*statusCode: {
                         404: function () {
                         ErrorDialog.show('비밀번호 재설정', '이메일및 전화번호와 일치하는 정보를 찾을수 없습니다.');
                         },
                         500: function () {
                         ErrorDialog.show('비밀번호 재설정', '비밀번호 재설정중 에러가 발생 하였습니다.');
                         }
                         }*/
                    });
                });

                // var TableModel = Backbone.Model.extend({
                //     /*defaults: {
                //         selected: false
                //     }*/
                // });
                //
                // var TablesCollection = Backbone.Collection.extend({
                //     model: TableModel
                // });
                //
                // var MyItemsView = Marionette.ItemView.extend({
                //     template: "#some-template"
                // });
                //
                // // var items = new TablesCollection({items: members});
                // var items = new TablesCollection({foo: "bar"}, {foo: "baz"});
                //
                // var view = new MyItemsView({
                //     collection: items
                // });
                //
                // new MyItemsView().render();

// alert(members.length);
                // self.test1();

                // hide processing which appears before login
                // ProcessingDialog.hide();
            }/*,
             statusCode: {
             500: function () {
             ErrorDialog.show('새 그룹 만들기', '사용자 목록 확인중 에러가 발생 하였습니다.');
             }
             }*/
        });
    } //,

    // https://lostechies.com/derickbailey/2011/10/11/backbone-js-getting-the-model-for-a-clicked-element/
    // tagName: "ul",
    // events: {
    //     "click li": "clicked"
    // },
    //
    // clicked: function (e) {
    //     e.preventDefault();
    //     var id = $(e.currentTarget).data("id");
    //
    //     ㅁㅁㅁalert(id);
    //     // debugger;
    //
    //     /*var title = $(e.currentTarget).data("title");
    //
    //     LoginUserManager.roomID = id;
    //     this.parent.trigger('chatroom_change');
    //
    //     $("#room_name").html(title);*/
    // }
}

module.exports = NewGrpDialog;