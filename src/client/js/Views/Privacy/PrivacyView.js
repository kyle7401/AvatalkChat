var Backbone = require('backbone');
// var template = require('./Privacy.hbs');
var _ = require('lodash');
var socket = require('socket.io-client');
var Cookies = require('js-cookie');

var U = require('../../libs/utils.js');
var Const = require('../../consts.js');
var Config = require('../../init');

var PrivacyView = Backbone.View.extend({

    el: null,

    initialize: function (options) {
        this.el = options.el;
        this.render();
    },

    render: function () {
        U.showTopBottom(true);

        var template = null;

        switch(Config.lang) {
            case 'zh':
                template = require('./Privacy_zh.hbs');
                break;

            case 'ja':
                template = require('./Privacy_ja.hbs');
                break;

            case 'en':
                template = require('./Privacy_en.hbs');
                break;

            default:
                template = require('./Privacy.hbs');
        }

        $(this.el).html(template());

        this.onLoad();

        return this;

    },

    onLoad: function () {
        $(window).scrollTop(0);

        $('#chat_link').on('click', function () {
            U.gotoChatUrl();
        });
    },

});

module.exports = PrivacyView;
