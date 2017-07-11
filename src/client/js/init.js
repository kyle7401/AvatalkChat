(function(global) {

    "use strict;"

    var Config = {};


    // Config.adminBaseUrl = "http://avatalk.co.kr:8080";
    Config.adminBaseUrl = "http://192.168.1.10:8080";

    /*Config.apiBaseUrl = "http://14.63.225.155:8000/chat/v1";
    Config.socketUrl = "http://14.63.225.155:8000/chat";*/
    /*Config.apiBaseUrl = "http://192.168.1.10:8000/chat/v1";
    Config.socketUrl = "http://192.168.1.10:8000/chat";*/

    /*Config.apiBaseUrl = "http://14.63.225.155:8000/chat/v1";
     Config.socketUrl = "http://14.63.225.155:8000/chat";*/
    Config.apiBaseUrl = "http://192.168.1.10:8000/v1";
     Config.socketUrl = "http://192.168.1.10:8000";
    /*Config.apiBaseUrl = "http://avatalk.co.kr/v1";
     Config.socketUrl = "http://avatalk.co.kr";*/

    Config.googleMapAPIKey = "";

    Config.defaultContainer = "#spika-container";
    // Config.lang = "en";
    Config.lang = "ko";
    // Config.lang = "ja";
    Config.showSidebar = true;
    Config.showTitlebar = true;
    Config.useBothSide = false;
    Config.thumbnailHeight = 256;

    // 현재 MessageView의 cid
    Config.MessageViewCID = 0;
    
    // Exports ----------------------------------------------
    module["exports"] = Config;

})((this || 0).self || global);