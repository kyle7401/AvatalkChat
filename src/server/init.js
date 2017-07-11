(function (global) {
    "use strict;"

    // Class ------------------------------------------------
    var Config = {};

    // Config.host = "14.63.225.155";
    Config.host = "192.168.1.10";
    // Config.host = "avatalk.co.kr";
    Config.port = 8000;
    // 아래를 바꾸면 client쪽 init.js 내용도 수정해 주어야 정상 동작함
    /*Config.urlPrefix = '/chat';
    Config.socketNameSpace = '/chat';*/
    Config.urlPrefix = '';
    Config.socketNameSpace = '';

    Config.imageDownloadURL = "http://" + Config.host + "/:" + Config.port + Config.urlPrefix + "/media/images/";
    Config.noavatarImg = "http://" + Config.host + ":" + Config.port + Config.urlPrefix + "/img/noavatar.png";

    // Config.chatDatabaseUrl = "mongodb://localhost/simplemessenger";
    // Config.chatDatabaseUrl = "mongodb://40.74.81.25/simplemessenger";
    Config.chatDatabaseUrl = "mongodb://localhost/avatalk";
    // Config.chatDatabaseUrl = "mongodb://test1:test@ds031932.mlab.com:31932/test1";
    // Config.dbCollectionPrefix = "spika_";
    Config.dbCollectionPrefix = "chat_";

    Config.uploadDir = 'public/uploads/';
    // Config.sendAttendanceMessage = true;
    Config.sendAttendanceMessage = false;

    /*Config.stickerBaseURL = 'http://spika.chat';
    Config.stickerAPI = Config.stickerBaseURL + '/api/v2/stickers/56e005b1695213295419f5df';*/
    Config.stickerBaseURL = "http://" + Config.host + ":" + Config.port;
    Config.stickerAPI = Config.stickerBaseURL + Config.urlPrefix + "/stickers/stickers.json";

    // Exports ----------------------------------------------
    module["exports"] = Config;

})((this || 0).self || global);
