var Backbone = require('backbone');
var template = require('./reset.hbs');
var _ = require('lodash');
var socket = require('socket.io-client');
var Cookies = require('js-cookie');

var U = require('../../libs/utils.js');
var Const = require('../../consts.js');
var ErrorDialog = require('../Modals/ErrorDialog/ErrorDialog');
var Settings = require('../../libs/Settings');
var LocalizationManager = require('../../libs/localizationManager.js');

var LoginView = Backbone.View.extend({

    el: null,
    phone_num: null,

    initialize: function (options) {
        this.el = options.el;
        this.render();
    },

    render: function () {
        U.showTopBottom(true);
        $(this.el).html(template());
        this.onLoad();
        return this;
    },

    onLoad: function () {
        var self = this;
        var member_id = Cookies.get('member_id');

        // 전화번호 확인
        SS('#btn-enter').on('click', function () {

            if (self.validate1()) {

                Backbone.ajax({
                    type: "PATCH",
                    // method: 'PATCH',
                    url: Settings.options.adminBaseUrl +'/api/mem/changepasswd',
                    dataType: 'json',
                    data : JSON.stringify({"member_id": member_id, "password": SS('#input-passwd').val()}),
                    contentType: "application/json; charset=UTF-8",
                    // headers: header,
                    success: function (response) {
                        Cookies.set('phone_num', SS('#input-phonenum').val());
                        U.goPage('login');
                        // alert(response.result);

                    },
                    statusCode: {
                        404: function () {
                            ErrorDialog.show('비밀번호 재설정', '이메일및 전화번호와 일치하는 정보를 찾을수 없습니다.');
                        },
                        405: function () {
                            ErrorDialog.show('비밀번호 재설정', '현재 사용중인 비밀번호와 다른 비밀번호로 변경해 주세요!');
                        },
                        500: function () {
                            ErrorDialog.show('비밀번호 재설정', '비밀번호 재설정중 에러가 발생 하였습니다.');
                        }
                    }
                });
            }
        });
    },

    validate1: function () {
        var result = true;

        var passwd = SS('#input-passwd');
        var passwd2 = SS('#input-passwd2');

        SS('.form-group').removeClass('has-error');
        SS('.label-error').text("");

        if (_.isEmpty(passwd.val())) {
            result = false;

            passwd.parent().find('.label-error').text(LocalizationManager.localize('Please enter a password!'));
            passwd.parent().addClass('has-error');
        }

        if (_.isEmpty(passwd2.val())) {
            result = false;

            passwd2.parent().find('.label-error').text(LocalizationManager.localize('Please enter your password verification!'));
            passwd2.parent().addClass('has-error');

            return result;
        }

        /*if (passwd.val().length < 6) {
            result = false;

            passwd.parent().find('.label-error').text("비밀번호는 6자리 이상 입력해 주세요!");
            passwd.parent().addClass('has-error');

            return result;
        }
        
        if (passwd2.val().length < 6) {
            result = false;

            passwd2.parent().find('.label-error').text("비밀번호 확인은 6자리 이상 입력해 주세요!");
            passwd2.parent().addClass('has-error');

            return result;
        }*/

        if (passwd.val() != passwd2.val()) {
            result = false;

            passwd2.parent().find('.label-error').text("비밀번호가 일치하지 않습니다!");
            passwd2.parent().addClass('has-error');
        }

        return result;
    }
});

module.exports = LoginView;
