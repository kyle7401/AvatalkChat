var Backbone = require('backbone');
// var template = require('./Service.hbs');
var _ = require('lodash');
var socket = require('socket.io-client');
var Cookies = require('js-cookie');
var Config = require('../../init');

var U = require('../../libs/utils.js');
var Const = require('../../consts.js');
// var LocalizationManager = require('../../libs/localizationManager.js');

var ServiceView = Backbone.View.extend({

    el: null,

    initialize: function (options) {
        this.el = options.el;
        this.render();
    },

    render: function () {
        U.showTopBottom(false);

        var template = null;

        switch(Config.lang) {
            case 'zh':
                template = require('./Service_zh.hbs');
                break;

            case 'ja':
                template = require('./Service_ja.hbs');
                break;

            case 'en':
                template = require('./Service_en.hbs');
                break;

            default:
                template = require('./Service.hbs');
        }

        $(this.el).html(template());

        // alert(Config.lang);

        this.onLoad();

        return this;
    },

    onLoad: function () {
        $('#li_chat, #li_chat2').on('click', function () {
            U.gotoChatUrl();
        });

        $(window).scrollTop(0);
    }
});

module.exports = ServiceView;