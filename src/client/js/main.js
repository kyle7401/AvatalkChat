// import libraries
window.$ = window.jQuery = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;
var Cookies = require('js-cookie');
require('jquery-colorbox');

var _ = require('lodash');
var bootstrap = require('bootstrap-sass');

require('./libs/global.js');
var U = require('./libs/utils.js');
var JSON = require('JSON2');
var LoginUserManager = require('./libs/loginUserManager.js');
var socketIOManager = require('./libs/socketIOManager');
var Config = require('./init.js');
var Const = require('./consts.js');
var UrlGenerator = require('./libs/urlGenerator');
var LocalizationManager = require('./libs/localizationManager.js');
var WebAPIManager = require('./libs/webAPIManager');
var ErrorDialog = require('./Views/Modals/ErrorDialog/ErrorDialog');
var ProcessingDialog = require('./Views/Modals/ProcessingDialog/ProcessingDialog');
var ViewHelpers = require('./libs/viewHelpers.js');
var Settings = require('./libs/Settings');

ViewHelpers.attach();

// app instance (global)
window.app = {

    login: function (userId, name, avatarURL, roomID, callBack) {

        var self = this;

        socketIOManager.init();
        LocalizationManager.init(Settings.options.lang);

        ProcessingDialog.show();

        WebAPIManager.post(
            UrlGenerator.userLogin(),

            {userID: userId, name: name, avatarURL: avatarURL, roomID: roomID},

            // success
            function (data) {

                socketIOManager.emit('login', {
                    name: name,
                    avatar: avatarURL,
                    roomID: roomID,
                    userID: userId
                });

                LoginUserManager.setLoginUser(name, avatarURL, roomID, userId, data.token);

                var loginInfo = {
                    id: userId,
                    name: name,
                    avatarURL: avatarURL,
                    roomID: roomID
                }

                Cookies.set(Const.COOKIE_KEY_LOGININFO, loginInfo);

                if (!_.isUndefined(callBack)) {
                    callBack();
                }
            },

            //error
            function (error) {
                ProcessingDialog.hide();
            }
        );
    },

    login2: function (userId, name, avatarURL, roomID, condition, callBack) {

        var self = this;

        if(!condition) condition = '';

        // socketIOManager.init();
        /*LocalizationManager.init(Settings.options.lang);
        alert('2 '+ Settings.options.lang);*/
        ProcessingDialog.show();

        WebAPIManager.post(
            UrlGenerator.userLogin(),

            {userID: userId, name: name, avatarURL: avatarURL, roomID: roomID},

            // success
            function (data) {

                // 채팅방 입장?
                /*socketIOManager.emit('login', {
                    name: name,
                    avatar: avatarURL,
                    roomID: roomID,
                    userID: userId
                });*/

                LoginUserManager.setLoginUser(name, avatarURL, roomID, userId, data.token, condition);

                var loginInfo = {
                    id: userId,
                    name: name,
                    avatarURL: avatarURL,
                    roomID: roomID,
                    condition: condition
                }

                Cookies.set(Const.COOKIE_KEY_LOGININFO, loginInfo);

                if (!_.isUndefined(callBack)) {
                    callBack();
                }
            },

            //error
            function (error) {
                ProcessingDialog.hide();
            }
        );
    }
}

// add some dummy functions to pass IE8
U.ie8Fix();

// disable ajax cache
$.ajaxSetup({
    cache: false
});

// load default language
var avatalk_lang = Cookies.get('avatalk_lang');

if (avatalk_lang) {
    Config.lang = avatalk_lang;
    LocalizationManager.init(Config.lang);
    // alert('avatalk_lang '+ avatalk_lang);
} else {
    LocalizationManager.init(Config.lang);
    // alert('Config.lang '+ Config.lang);
}

// setting up router
var AppRouter = Backbone.Router.extend({
    routes: {
        "login": "loginRoute",
        "authcode": "AuthCodeRoute",// 인증코드 입력
        "authcode2": "AuthCodeRoute2",// 인증코드 입력(비밀번호 재설정)
        "service": "serviceRoute", // 서비스 소개
        "privacy": "privacyRoute", // 개인정보 취급방침
        "terms": "termsRoute", // 이용약관
        "findemail": "emailRoute", // 이메일 찾기
        "findpasswd": "passwdRoute", // 비밀번호 찾기
        "resetpasswd": "resetRoute", // 비밀번호 재설정
        "test1": "test1Route", // 테스트
        "test2": "test2Route", // 테스트
        "colors": "colorsRoute",
        "main": "mainRoute",
        "*actions": "defaultRoute"
    }
});

// Initiate the router
var app_router = new AppRouter;

// TODO : 서비스 소개  |   개인정보 취급방침  |   이용약관 은 로그인 하지 않아도 볼수 있어야 한다
app_router.on('route:defaultRoute', function (actions) {

    if (_.isEmpty(Settings.options))
        Settings.options = Config;

    var ServiceView = require('./Views/Service/ServiceView.js');

    var view = new ServiceView({
        // 'el': Config.defaultContainer
        'el': '#service-container'
    });

});
/*app_router.on('route:defaultRoute', function (actions) {

    var queryInfo = U.getURLQuery();

    Settings.options = Config;

    if (!_.isEmpty(queryInfo.params)) {

        var bootOptions = JSON.parse(queryInfo.params);
        var user = bootOptions.user;

        Settings.options = _.merge(Config, bootOptions.config);

        if (!_.isEmpty(user) && !_.isEmpty(user.id) && !_.isEmpty(user.name) && !_.isEmpty(user.roomID)) {

            app.login(
                user.id,
                user.name,
                user.avatarURL,
                user.roomID,

                function () {

                    var MainView = require('./Views/Main/MainView.js');

                    var view = new MainView({
                        'el': Config.defaultContainer
                    });

                }
            );

        }


    } else {
        U.goPage('login');
    }

});*/

// 로그인
app_router.on('route:loginRoute', function (actions) {

    if (_.isEmpty(Settings.options))
        Settings.options = Config;

    // var LoginView = require('./Views/Login/LoginView.js');
    var LoginView = require('./Views/Login/login0.js');

    var view = new LoginView({
        'el': Config.defaultContainer
    });
});

// 인증코드 입력
app_router.on('route:AuthCodeRoute', function (actions) {

    if (_.isEmpty(Settings.options))
        Settings.options = Config;

    var AuthCodeView = require('./Views/Login/login1.js');

    var view = new AuthCodeView({
        'el': Config.defaultContainer
    });
});

// 인증코드 입력(비밀번호 재설정)
app_router.on('route:AuthCodeRoute2', function (actions) {

    if (_.isEmpty(Settings.options))
        Settings.options = Config;

    var AuthCodeView = require('./Views/Passwd/authcode.js');

    var view = new AuthCodeView({
        'el': Config.defaultContainer
    });
});

// 이메일 찾기
app_router.on('route:emailRoute', function (actions) {

    if (_.isEmpty(Settings.options))
        Settings.options = Config;

    var FindEmailView = require('./Views/Email/email.js');

    var view = new FindEmailView({
        'el': Config.defaultContainer
    });
});

// 비밀번호 찾기
app_router.on('route:passwdRoute', function (actions) {

    if (_.isEmpty(Settings.options))
        Settings.options = Config;

    var FindPasswdView = require('./Views/Passwd/passwd.js');

    var view = new FindPasswdView({
        'el': Config.defaultContainer
    });
});

// 비밀번호 재설정
app_router.on('route:resetRoute', function (actions) {

    if (_.isEmpty(Settings.options))
        Settings.options = Config;

    var ResetPasswdView = require('./Views/Passwd/reset.js');

    var view = new ResetPasswdView({
        'el': Config.defaultContainer
    });
});

// 서비스 소개
app_router.on('route:serviceRoute', function (actions) {

    if (_.isEmpty(Settings.options))
        Settings.options = Config;

    var ServiceView = require('./Views/Service/ServiceView.js');

    var view = new ServiceView({
        // 'el': Config.defaultContainer
        'el': '#service-container'
    });

});

// 개인정보 취급방침
app_router.on('route:privacyRoute', function (actions) {

    if (_.isEmpty(Settings.options))
        Settings.options = Config;

    var PrivacyView = require('./Views/Privacy/PrivacyView.js');

    var view = new PrivacyView({
        'el': Config.defaultContainer
    });

});

// 이용약관
app_router.on('route:termsRoute', function (actions) {

    if (_.isEmpty(Settings.options))
        Settings.options = Config;

    var TermsView = require('./Views/Terms/TermsView.js');

    var view = new TermsView({
        'el': Config.defaultContainer
    });

});

// 테스트
app_router.on('route:test1Route', function (actions) {

    if (_.isEmpty(Settings.options))
        Settings.options = Config;

    var TestView = require('./Views/Test/test1.js');

    var view = new TestView({
        'el': Config.defaultContainer
    });

});

// 테스트
app_router.on('route:test2Route', function (actions) {

    if (_.isEmpty(Settings.options))
        Settings.options = Config;

    var TestView = require('./Views/Test/test2.js');

    var view = new TestView({
        'el': Config.defaultContainer
    });

    /*var Marionette = require('backbone.marionette');  // 1

    var HelloWorld = Marionette.LayoutView.extend({  // 2
        el: '#app-hook',  // 3
        template: require('./Views/Test/test2.hbs')  // 4
    });

    var hello = new HelloWorld();  // 5

    hello.render();  // 6*/

});

app_router.on('route:colorsRoute', function (actions) {

    var ColorsView = require('./Views/Colors/ColorsView.js');

    var view = new ColorsView({
        'el': Config.defaultContainer
    });

});

app_router.on('route:mainRoute', function (actions) {

    if (_.isEmpty(Settings.options))
        Settings.options = Config;

    if (_.isNull(LoginUserManager.user)) {

        var loginInfo = Cookies.getJSON(Const.COOKIE_KEY_LOGININFO);

        if (_.isUndefined(loginInfo) || loginInfo == null)
            U.goPage('login');

        else {

            // alert('자동 로그인 : '+ loginInfo.id);

            app.login(
                loginInfo.id,
                loginInfo.name,
                loginInfo.avatarURL,
                loginInfo.roomID,
                function () {

                    U.chkMbrExist().then(function (result) {

                        var MainView = require('./Views/Main/MainView.js');

                        var view = new MainView({
                            'el': Config.defaultContainer
                        });
                    });
                }
            );

            /*app.login2(response.id, response.nick_name, Settings.options.adminBaseUrl + response.profile, 1, response.condition, function () {
                U.goPage('main');
            });*/

        }

    } else {

        // alert('이미 로그인 됨!');

        var MainView = require('./Views/Main/MainView.js');

        var view = new MainView({
            'el': Config.defaultContainer
        });

    }


});

$(function () {

    // Start Backbone history a necessary step for bookmarkable URL's
    Backbone.history.start();

});

window.startSpikaIntoDiv = function () {

    Settings.options = _.merge(Config, window.bootOptions.config);

    Config.defaultContainer = "#" + window.bootOptions.attachTo;

    var userid = window.bootOptions.user.id;
    var roomId = window.bootOptions.user.roomID;
    var avatarURL = window.bootOptions.user.avatarURL;
    var name = window.bootOptions.user.name;

    app.login(
        userid,
        name,
        avatarURL,
        roomId,
        function () {

            var MainView = require('./Views/Main/MainView.js');

            var view = new MainView({
                'el': Config.defaultContainer
            });

        }
    );


}