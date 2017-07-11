var Backbone = require('backbone');
// var template = require('./Terms.hbs');
var _ = require('lodash');
var socket = require('socket.io-client');
var Cookies = require('js-cookie');

var U = require('../../libs/utils.js');
var Const = require('../../consts.js');
var Config = require('../../init');

var TermsView = Backbone.View.extend({

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
                template = require('./Terms_zh.hbs');
                break;

            case 'ja':
                template = require('./Terms_ja.hbs');
                break;

            case 'en':
                template = require('./Terms_en.hbs');
                break;

            default:
                template = require('./Terms.hbs');
        }

        $(this.el).html(template());

        this.onLoad();

        return this;

    },

    onLoad: function () {
        $(window).scrollTop(0);

        $('#chat_link').on('click', function () {
console.log('gotoChatUrl');
            U.gotoChatUrl();
        });
    },

});

module.exports = TermsView;
