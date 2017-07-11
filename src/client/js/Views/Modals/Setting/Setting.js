var $ = require('jquery');
var _ = require('lodash');
var U = require('../../../libs/utils.js');
var template = require('./Setting.hbs');
var Settings = require('../../../libs/Settings');
var Cookies = require('js-cookie');
var Const = require('../../../consts.js');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');

var LoginUserManager = require('../../../libs/loginUserManager.js');
var Cookies = require('js-cookie');
var Const = require('../../../consts.js');
var Config = require('../../../init');
var LocalizationManager = require('../../../libs/localizationManager.js');

// var Backbone = require('backbone');
// var Main = require('../../../main');

var NewGrpDialog = {

    member_id: null,
    parent: null,

    show: function (title, parent, text, onRetry) {

        var self = this;

        self.parent = parent;

        $('body').append(template({
            avatarURL: LoginUserManager.user.get('avatarURL'),
            name: LoginUserManager.user.get('name'),
            condition: LoginUserManager.user.get('condition')
        }));

        $('#modal1').on('hidden.bs.modal', function (e) {
            $('#modal1').remove();
        });

        $('#modal1').modal('show');

        $('#modal-btn-close').on('click', function () {
            self.hide();
        });

        $('#modal-btn-ok').on('click', function () {
            self.hide();
        });

        if (_.isUndefined(onRetry)) {
            $('#modal-btn-retry').hide();
        } else {
            $('#modal-btn-retry').on('click', function () {
                if (!_.isUndefined(onRetry))
                    onRetry();
            });
        }

        $('#modal-logout').on('click', function () {
            LoginUserManager.user = null;
            Cookies.set(Const.COOKIE_KEY_LOGININFO, null);
            parent.gotoLogin();
            self.hide();
        });

        $( '#selLanguage' ).change(function() { // 언어가 변경되면
            // alert( $(this).val() );
            Config.lang = $(this).val();
            LocalizationManager.init(Config.lang);
            Cookies.set('avatalk_lang', Config.lang);
            parent.pageReload(Config.lang);
            self.hide();
        });

        $("#selLanguage").val(Config.lang);
    },
    hide: function (onFinish) {

        $('#modal1').on('hidden.bs.modal', function (e) {

            $('#modal1').remove();

            if (!_.isUndefined(onFinish)) {
                onFinish();
            }

        })

        $('#modal1').modal('hide');
    }
}

module.exports = NewGrpDialog;