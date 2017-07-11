var Backbone = require('backbone');
var template = require('./login1.hbs');
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
    country_code: null,

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

        var phone = Cookies.get('phone_num');
        var country_code = Cookies.get('country_code');

        this.phone_num = phone;
        this.country_code = country_code;
// alert(phone +'@'+ this.phone_num);
        SS('#phone_number').html(phone);
        SS('#country_code').html(country_code);

        // 인증번호 확인
        SS('#btn-enter').on('click', function () {
// alert(phone +'@'+ this.phone_num);
            if (self.validate1()) {

                Backbone.ajax({
                    type: "GET",
                    url: Settings.options.adminBaseUrl + '/api/mem/confirmnum2?phone_num=' + phone +'&confirm_cd='+ SS('#input-authcode').val(),
                    dataType: 'json',
                    contentType: "application/json; charset=UTF-8",
                    // headers: header,
                    success: function (response) {
                        // alert(response.id +'@'+ response.nick_name +'@'+ Settings.options.adminBaseUrl + response.profile);
                        app.login2(response.id, response.nick_name, Settings.options.adminBaseUrl + response.profile, 1, response.condition, function () {
                            U.goPage('main');
                        });
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

            authcode.parent().find('.label-error').text(LocalizationManager.localize('Please enter your verification code!'));
            authcode.parent().addClass('has-error');
        }

        return result;
    }
});

module.exports = LoginView;