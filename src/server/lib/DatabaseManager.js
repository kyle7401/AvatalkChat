var mongoose = require('mongoose');
var _ = require('lodash');
var Const = require('../const.js');

var DatabaseManager = {
    
    messageModel:null,
    userModel:null,
    fileModel:null,
    chattingRoomModel: null,
    
    init: function(options){
		
		var self = this;
		
        // Connection to our chat database
        console.log("Connecting mongoDB " + options.chatDatabaseUrl);
        
        try{
            
            if(!mongoose.connection.readyState){
    
                mongoose.connect(options.chatDatabaseUrl, function(err){
                    if (err) {
                        console.log("Failed to connect MongoDB!");
                        console.error(err);
                    } else {
                        // Defining a schema
                        self.setupSchema();
                    }
                });
                
            } else {
                // Defining a schema
                self.setupSchema();
            }

        } catch(ex){
	        console.log("Failed to connect MongoDB!");
	        throw ex;
        }

    },
    
    setupSchema : function(){
        
        this.messageModel = require('../Models/MessageModel').init();
        this.userModel = require('../Models/UserModel').init();
        this.fileModel = require('../Models/FileModel').init();

        // 이하 추가
        this.chattingRoomModel = require('../Models/ChattingRoomModel').init();
        /*this.promote = require('../Models/promote');
        this.point = require('../Models/point');
        this.chatting_room = require('../Models/chatting_room');*/

        // Use native promises
        mongoose.Promise = global.Promise;
    }
}

module["exports"] = DatabaseManager;