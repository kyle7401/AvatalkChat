var Backbone = require('backbone');
var template = require('./authcode.hbs');
var _ = require('lodash');
var socket = require('socket.io-client');
var Cookies = require('js-cookie');

var U = require('../../libs/utils.js');
var Const = require('../../consts.js');
var ErrorDialog = require('../Modals/ErrorDialog/ErrorDialog');
var Settings = require('../../libs/Settings');

var LoginView = Backbone.View.extend({

    el: null,
    country_code: null,
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

        var country_code = Cookies.get('country_code');
        var phone = Cookies.get('phone_num');

        this.country_code = country_code;
        this.phone_num = phone;
// alert(country_code +'@'+ this.country_code);
// alert(phone +'@'+ this.phone_num);
        SS('#country_code').html(country_code);
        SS('#phone_number').html(phone);

        // 인증번호 확인
        SS('#btn-enter').on('click', function () {
/*alert(phone +'@'+ this.phone_num);
return;*/
            if (self.validate1()) {

                Backbone.ajax({
                    type: "GET",
                    url: Settings.options.adminBaseUrl + '/api/mem/confirmnum2a?phone_num=' + phone +'&confirm_cd='+ SS('#input-authcode').val(),
                    dataType: 'json',
                    contentType: "application/json; charset=UTF-8",
                    // headers: header,
                    success: function (response) {
                        // alert(response.id);
                        Cookies.set('member_id', response.id);
                        U.goPage('resetpasswd');
                    },
                    statusCode: {
                        404: function () {
                            ErrorDialog.show(LocalizationManager.localize('Verification number verification'), LocalizationManager.localize('Authentication numbers do not match.'));
                        },
                        500: function () {
                            ErrorDialog.show('인증번호 확인', '인증번호 확인중 에러가 발생 하였습니다.');
                        }
                    }
                });
            }
        });
    },

    validate1: function () {
        var result = true;

        var authcode = SS('#input-authcode');


        SS('.form-group').removeClass('has-error');
        SS('.label-error').text("");

        if (_.isEmpty(authcode.val())) {
            result = false;

            authcode.parent().find('.label-error').text("인증코드를 입력해 주세요!");
            authcode.parent().addClass('has-error');
        }

        return result;
    }
});

module.exports = LoginView;
