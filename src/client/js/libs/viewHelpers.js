var CONST = require('../consts');
var _ = require('lodash');
var U = require('./utils.js');
var LocalizationManager = require('./localizationManager.js');
var Handlebars = require('hbsfy/runtime');
Handlebars.registerHelper('test', function (context, options) {
    return options.fn(context);
});

(function (global) {
    "use strict;"

    // Class ------------------------------------------------
    function ViewHelpers() {
    };

    // Header -----------------------------------------------
    ViewHelpers.prototype.attach = attach;

    // Implementation ---------------------------------------

    function attach() {

        Handlebars.registerHelper("formatDate", function (ut) {
            return U.formatDate(ut, false);
        });

        Handlebars.registerHelper("formatTime", function (ut) {
            return U.formatTime(ut);
        });

        Handlebars.registerHelper("length", function (ary) {
            return ary.length;
        });

        Handlebars.registerHelper("l10n", function (text) {
            return LocalizationManager.localize(text);
        });

        // http://soulduse.tistory.com/3
/*        Handlebars.registerPartial("top_header", function () {
            return '<div class="top_header">' +
                '<div class="c_align">' +
                '<a class="logo"><img src="img/logo.png" alt=""/></a>' +
                '<ul>' +
                '<li class="line"><a href="#service">{{l10n "link_service"}}</a></li>' +
                '<li><a href="#main">{{l10n "link_chat"}}</a></li>' +
                '</ul>' +
                '</div>' +
                '</div>';
        });

        Handlebars.registerPartial("bottom_f", function () {
            return '<div class="bottom_f login">' +
                '<p>' +
                '<a href="#service">{{l10n "link_service"}}</a>&nbsp;&nbsp;|&nbsp;&nbsp;' +
                '<a id="chat_link" style="cursor: pointer">{{l10n "link_chat"}}</a>&nbsp;&nbsp;|&nbsp;&nbsp;' +
                '<a href="#privacy">{{l10n "link_privacy"}}</a>&nbsp;&nbsp;|&nbsp;&nbsp;' +
                '<a href="#terms">{{l10n "link_terms"}}</a>' +
                '</p>' +
                '<p>Copyright 2016 C&amp;K Technology. All Rights Reserved.</p>' +
                '</div>';
        });*/

    }

    // Exports ----------------------------------------------
    module["exports"] = new ViewHelpers();

})((this || 0).self || global);