var Backbone = require('backbone');
var template = require('./passwd.hbs');
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

        Backbone.ajax({
            type: "GET",
            url: Settings.options.adminBaseUrl + '/api/get/country_code',
            dataType: 'json',
            contentType: "application/json; charset=UTF-8",
            // headers: header,
            success: function (data) {
                // alert(data);
                for (var i = 0; i < data.length; i++) {
                    $('#country_code').append("<option value='" + data[i]['id'] + "'>" + data[i]['name'] + "</option>");
                }

                $("#country_code").val("82");
            }/*,
             statusCode: {
             500: function () {
             ErrorDialog.show('새 그룹 만들기', '사용자 목록 확인중 에러가 발생 하였습니다.');
             }
             }*/
        });

        // 전화번호 확인
        SS('#btn-enter').on('click', function () {
// alert(phone +'@'+ this.phone_num);
            if (self.validate1()) {

                Backbone.ajax({
                    type: "GET",
                    url: Settings.options.adminBaseUrl +'/api/mem/reqcertnum3a?country_code='+ SS('#country_code').val() +'&phone_num='+ SS('#input-phonenum').val() +'&email='+ SS('#input-email').val(),
                    dataType: 'json',
                    contentType: "application/json; charset=UTF-8",
                    // headers: header,
                    success: function (response) {
                        Cookies.set('country_code', SS('#country_code').val());
                        Cookies.set('phone_num', SS('#input-phonenum').val());
                        U.goPage('authcode2');
                        // alert(response.result);

                    },
                    statusCode: {
                        404: function () {
                            ErrorDialog.show('비밀번호 재설정', '이메일및 전화번호와 일치하는 정보를 찾을수 없습니다.');
                        },
                        500: function () {
                            ErrorDialog.show('비밀번호 재설정', '이메일및 전화번호 확인중 에러가 발생 하였습니다.');
                        }
                    }
                });
            }
        });
    },

    validate1: function () {
        var result = true;

        var email = SS('#input-email');
        var phonenum = SS('#input-phonenum');

        SS('.form-group').removeClass('has-error');
        SS('.label-error').text("");

        if (_.isEmpty(email.val())) {
            result = false;

            email.parent().find('.label-error').text(LocalizationManager.localize('Please enter your email!'));
            email.parent().addClass('has-error');
        }

        if (_.isEmpty(phonenum.val())) {
            result = false;

            phonenum.parent().find('.label-error').text(LocalizationManager.localize('Please enter your phone number!'));
            phonenum.parent().addClass('has-error');
        }

        return result;
    }
});

module.exports = LoginView;
