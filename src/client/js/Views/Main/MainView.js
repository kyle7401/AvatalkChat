var Backbone = require('backbone');
var _ = require('lodash');

var LoginUserManager = require('../../libs/loginUserManager.js');
var ErrorDialog = require('../Modals/ErrorDialog/ErrorDialog');
var U = require('../../libs/utils.js');
var template = require('./Main.hbs');
var CONST = require('../../consts');
var Settings = require('../../libs/Settings');

var socketIOManager = require('../../libs/socketIOManager');

var NewGroup = require('../Modals/NewGroup/NewGroup');
var Setting = require('../Modals/Setting/Setting');
var RoomSetting = require('../Modals/RoomSetting/RoomSetting');
var Contact = require('../Modals/Contact/Contact');

/**
 * Main View
 * 
 * @class
 */
var MainView = Backbone.View.extend({
     
    el : null,
    view1 : null,
    view2 : null,

    /**
     * Initialize MainView
     * 
     * @method
     * @name MainView.initialize
     * @param options
    */
    initialize: function(options) {
        this.el = options.el;
        this.render();

        this.on('chatroom_change', this.fnChatRoomChange); // 채팅방 목록 ul 클릭시 채팅방 메세지 가져오기
    },

    /**
     * Render MainView
     * 
     * @method
     * @name MainView.render
    */
    render: function() {
        U.showTopBottom(true);
        $(this.el).html(template());
        this.onLoad();
        return this;
    },
    
    onLoad: function(){
        var self = this;
        
        var SidebarView = require('./Sidebar/SidebarView.js'); 
        var view1 = new SidebarView({
            'el': "#sidebar-content",
            parent: this
        });

        this.view1 = view1;

        var MessagingView = require('./Messaging/MessagingView.js');
        var view2 = new MessagingView({
            'el': "#messaging-content"
        });

        this.view2 = view2;

        var MessageDetailView = require('./MessageDetail/MessageDetailView.js');
        var view3 = new MessageDetailView({
            'el': "#message-info"
        });

        if(Settings.options.showSidebar == false){
           SS('#sidebar').css('display','none');
           SS('#messaging').attr('class','col-md-12 col-sm-12 col-xs-12'); 
        }
        
        if(Settings.options.showTitlebar == false){
           SS('#titlebar').css('display','none');
        }

        this.adjustSize();
        
        $( window ).resize(function() {
            self.adjustSize();
        });
        
        $(window).on('click',function(){
	    	Backbone.trigger(CONST.EVENT_ON_GLOBAL_CLICK);
        });

        // 이하 추가 ===========================================

        // 새 그룹 생성
        SS('#btn-newgrp').on('click', function () {
            U.chkMbrExist().then(function (result) {
                NewGroup.show('', self);
            });
        });
        
        // 친구목록
        SS('#btn-contact').on('click', function () {
            U.chkMbrExist().then(function (result) {
                Contact.show('', self);
            });
        });

        // 설정
        SS('#btn-setting').on('click', function () {
            Setting.show('', self);
        });

        // 채팅방 설정
        SS('#btn-room-setting').on('click', function () {
            var id = $('#btn-room-setting').data('id');
            var title = $('#btn-room-setting').data('title');
            var profile = $('#btn-room-setting').data('profile');
            var moderators = $('#btn-room-setting').data('moderators');
            var division = $('#btn-room-setting').data('division');

            // alert(id +'@'+ title +'@'+ profile);

            RoomSetting.show(id, title, profile, moderators, division, self);
        });

        // view2.loadNextMessage();

        // http://stackoverflow.com/questions/25511721/backbone-trigger-the-parent-view-event-from-child-view
        // this.listenTo(view1, 'clicked2', this.clicked2);

        // view1.prototype.clicked = function () {
        // view1.clicked = function (e) {
        /*clicked2 = function () {
            alert('view1.prototype.clicked');
        }*/
    },
    
    adjustSize: function(){

        if(Settings.options.showTitlebar == false){            
            SS('#message-info').css('top','0px');
        }
        
        /*SS('#message-info').height($(window).height() - SS('#message-info').position().top - SS('#text-message-box-container').height());
        SS('#sidebar').height($(window).height());
        SS('#messaging').height($(window).height());*/

        var ExtraHeigh = 180;

        SS('#message-info').height($(window).height() - SS('#message-info').position().top - SS('#text-message-box-container').height() - ExtraHeigh);
        SS('#sidebar').height($(window).height() - ExtraHeigh);
        SS('#messaging').height($(window).height() - ExtraHeigh);
        
    },

    fnChatRoomLeave: function(){
        socketIOManager.emit('disconnect', {
        });
    },

    fnChatRoomChange: function(){
        var self = this;

        U.chkMbrExist().then(function (result) { // TODO : 먼저 접속을 끊어보자
// alert('userLeft0');
//             socketIOManager.emit('userLeft', LoginUserManager.user);
// alert('userLeft1');

            // 채팅방 입장?
            socketIOManager.init();

            // 아래가 없으면 메세지 수신이 안된다
            socketIOManager.emit('login', {
                name: LoginUserManager.user.name,
                avatar: LoginUserManager.user.avatarURL,
                roomID: LoginUserManager.roomID,
                userID: LoginUserManager.user.id
            });

            $('#text-message-box-container').css('display', 'block');

            // this.view2.loadNextMessage2();
            self.view2.loadNextMessage2();
        });

    },

    // 새 그룹 생성후 채팅방 목록 갱신
    refreshRooms: function () {
        this.view1.refreshRooms();
    },

    // 로그아웃후 로그인 화면으로 이동
    gotoLogin: function () {
        // socketIOManager.init();
        U.goPage('login');
    },

    pageReload: function () {
        // alert('pageReload');
        this.render();
    },

    exitNdelete: function () {
        // U.goPage('main');

        // socketIOManager.init();

        var self = this;
        self.view2.clearMessage();
        self.refreshRooms();
    },

    exitRoom: function (room_id) {
        var self = this;
        var member_id = LoginUserManager.user.get('id');

        Backbone.ajax({
            type: "PATCH",
            // method: 'PATCH',
            url: Settings.options.adminBaseUrl +'/api/chat/exit',
            dataType: 'json',
            data : JSON.stringify({"member_id": member_id, "room_id": room_id}),
            contentType: "application/json; charset=UTF-8",
            // headers: header,
            success: function (response) {
                self.exitNdelete();
            },
            error: function (e) {
                alert(e);
            }
        });
    },

    deleteRoom: function (room_id) {
        var self = this;
        // var member_id = LoginUserManager.user.get('id');

        Backbone.ajax({
            type: "DELETE",
            // method: 'PATCH',
            url: Settings.options.adminBaseUrl +'/api/chat/remove',
            dataType: 'json',
            data : JSON.stringify({"room_id": room_id}),
            contentType: "application/json; charset=UTF-8",
            // headers: header,
            success: function (response) {
                self.exitNdelete();
            },
            error: function (e) {
                alert(e);
            }
        });
    }
});

module.exports = MainView;