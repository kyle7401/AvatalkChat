var Backbone = require('backbone');
var template = require('./email.hbs');
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
    step: 1,

    initialize: function (options) {
        this.el = options.el;
        this.render();
    },

    render: function () {
        U.showTopBottom(true);
        $(this.el).html(template());
        self.step = 1;
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
// alert('#btn-enter');
            if(self.step == 1) {
                if (self.validate1()) {

                    var country_code = SS('#country_code').val();

                    Backbone.ajax({
                        type: "GET",
                        // url: Settings.options.adminBaseUrl + '/api/mem/findemail?phone_num=' + SS('#input-phonenum').val(),
                        url: Settings.options.adminBaseUrl + '/api/mem/findemaila?country_code='+ country_code +'&phone_num=' + SS('#input-phonenum').val(),
                        dataType: 'json',
                        contentType: "application/json; charset=UTF-8",
                        // headers: header,
                        success: function (response) {
                            // alert(response.result);
                            SS('#pemail').text(response.result);
                            SS('#divResult').css('display', 'block');
                            self.step = 2;
                        },
                        statusCode: {
                            404: function () {
                                ErrorDialog.show(LocalizationManager.localize('Find email'), LocalizationManager.localize('We could not find any information that matched your phone number.'));
                            },
                            500: function () {
                                ErrorDialog.show('이메일 찾기', '이메일 확인중 에러가 발생 하였습니다.');
                            }
                        }
                    });
                }
            } else {
                U.goPage('login');
            }

        });
    },

    validate1: function () {
        var result = true;

        var phonenum = SS('#input-phonenum');


        SS('.form-group').removeClass('has-error');
        SS('.label-error').text("");

        if (_.isEmpty(phonenum.val())) {
            result = false;

            phonenum.parent().find('.label-error').text(LocalizationManager.localize('Please enter your phone number!'));
            phonenum.parent().addClass('has-error');
        }

        return result;
    }
});

module.exports = LoginView;
