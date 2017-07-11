var Backbone = require('backbone');
var template = require('./login0.hbs');
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
    radioVal: 't',

    initialize: function (options) {
        this.el = options.el;
        this.render();
    },

    render: function () {
        U.showTopBottom(true);

        $(this.el).html(template());

        this.showHideDiv();

        this.onLoad();
        return this;
    },

    onLoad: function () {
        var self = this;
        // var loginInfo = Cookies.getJSON(Const.COOKIE_KEY_LOGININFO);

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

        // 인증번호 요청
        SS('#btn-enter1').on('click', function () {

            if (self.validate1()) {

                var country_code = SS('#country_code');
                var phone = SS('#input-phone');

                /*Cookies.set('phone_num', phone.val());

                var phone_num = Cookies.get('phone_num');
                alert(phone_num);

                alert('인증번호 요청 '+ phone.val());*/

                Backbone.ajax({
                    type: "GET",
                    // url: Settings.options.adminBaseUrl + '/api/mem/reqcertnum2?phone_num=' + phone.val(),
                    url: Settings.options.adminBaseUrl + '/api/mem/reqcertnum2a?country_code='+ country_code.val() +'&phone_num=' + phone.val(),
                    dataType: 'json',
                    contentType: "application/json; charset=UTF-8",
                    // headers: header,
                    success: function (response) {
                        // alert(response);
                        Cookies.set('country_code', country_code.val());
                        Cookies.set('phone_num', phone.val());
                        U.goPage('authcode');
                    },
                    statusCode: {
                        404: function () {
                            ErrorDialog.show(LocalizationManager.localize('Request verification number'), LocalizationManager.localize('It is not a registered phone number.'));
                        },
                        500: function () {
                            ErrorDialog.show('인증번호 요청', '인증번호 요청중 에러가 발생 하였습니다.');
                        }
                    }/*,
                     error: function (e) {
                     alert('error'+ e);
                     ErrorDialog.show('Network Error','Critical Error',function(){
                     ErrorDialog.hide(function(){
                     self.get(url,onSuccess,onError);
                     });
                     });

                     if(!_.isUndefined(onError)){
                     onError();
                     }
                     }*/
                });

                /*var name = SS('#input-name').val();

                 app.login2(id, name, avatar, room, function () {
                 U.goPage('main');
                 });*/
            }
        });

        // 이메일로 로그인
        SS('#btn-enter2').on('click', function () {
            if (self.validate1()) {
                var email = SS('#input-email');
                var pass = SS('#input-pass');

                Backbone.ajax({
                    type: "GET",
                    url: Settings.options.adminBaseUrl + '/api/mem/loginemail2?email=' + email.val() +'&password='+ pass.val(),
                    dataType: 'json',
                    contentType: "application/json; charset=UTF-8",
                    // headers: header,
                    success: function (response) {
                        // alert(response.nick_name +' @ '+ response.condition);
                        app.login2(response.id, response.nick_name, Settings.options.adminBaseUrl + response.profile, 1, response.condition, function () {
                            U.goPage('main');
                        });
                    },
                    statusCode: {
                        404: function () {
                            ErrorDialog.show(LocalizationManager.localize('Email login'), LocalizationManager.localize('Email or password do not match.'));
                        },
                        405: function () {
                            ErrorDialog.show(LocalizationManager.localize('Request verification number'), LocalizationManager.localize('You must sign in with your phone number when you sign in within 7 days of your opt-out request.'));
                        },
                        500: function () {
                            ErrorDialog.show('이메일 로그인', '이메일 로그인중 에러가 발생 하였습니다.');
                        }
                    }
                });
            }
        });
    },

    validate1: function () {
        var result = true;

        SS('.form-group').removeClass('has-error');
        SS('.label-error').text("");

        if(this.radioVal == 't') { // 전화번호

            var phone = SS('#input-phone');

            if (_.isEmpty(phone.val())) {
                result = false;

                phone.parent().find('.label-error').text(LocalizationManager.localize('Please enter your phone number!'));
                phone.parent().addClass('has-error');
            }
        } else { // 이메일
            var email = SS('#input-email');

            if (_.isEmpty(email.val())) {
                result = false;

                email.parent().find('.label-error').text(LocalizationManager.localize('Please enter your email!'));
                email.parent().addClass('has-error');
            }

            var pass = SS('#input-pass');

            if (_.isEmpty(pass.val())) {
                result = false;

                pass.parent().find('.label-error').text(LocalizationManager.localize('Please enter a password!'));
                pass.parent().addClass('has-error');
            }
        }

        return result;
    },

    events: {
        'change input[type=radio]': 'changedRadio'
    },

    changedRadio: function(event) {
        // var val = $('input[type=radio]:checked').val();
        $this = $(event.target);
        this.radioVal = $this.val();
        // alert('changedRadio = '+ this.radioVal);
        this.showHideDiv();
    },
    showHideDiv: function() {
        this.$('#divTel1')[this.radioVal == 't' ? 'show' : 'hide']();
        this.$('#divEmail1')[this.radioVal == 'e' ? 'show' : 'hide']();
        this.$('#divEmail2')[this.radioVal == 'e' ? 'show' : 'hide']();
        this.$('#divEmail3')[this.radioVal == 'e' ? 'show' : 'hide']();
        this.$('#divPasswd')[this.radioVal == 'e' ? 'show' : 'hide']();

        this.$('#btn-enter1')[this.radioVal == 't' ? 'show' : 'hide']();
        this.$('#btn-enter2')[this.radioVal == 'e' ? 'show' : 'hide']();
    }
});

module.exports = LoginView;
