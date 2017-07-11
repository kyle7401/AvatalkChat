var mongoose = require('mongoose');
var _ = require('lodash');
var Const = require('../const.js');
var async = require('async');
var Util = require('../lib/Utils');
var Settings = require("../lib/Settings");

var ChattingRoomModel = function () {

};

ChattingRoomModel.prototype.model = null;

ChattingRoomModel.prototype.init = function () {

    // Defining a schema
    var chattingRoomSchema = new mongoose.Schema({
        division: {type: Number, index: true},
        title: {type: String, index: true},
        moderators: { type: mongoose.Schema.Types.ObjectId, index: true },
        members:[],
        created: Number
    });

    chattingRoomSchema.methods.addMember = function (user, callBack) {

        var members = this.members;
        var self = this;

        var listOfUsers = [];

        _.forEach(members, function (memberObj) {
            listOfUsers.push(memberObj.user);
        });

        if (_.indexOf(listOfUsers, user._id) == -1) {

            members.push({user: user._id, at: Util.now()});

            this.update({
                members: members
            }, {}, function (err, userResult) {

                if (callBack)
                    callBack(err, self);
            });
        }
    }

    this.model = mongoose.model("chatting_room_old", chattingRoomSchema);
    return this.model;

}

/*ChattingRoomModel.prototype.findUserbyId = function (id, callBack) {

    this.model.findOne({userID: new RegExp("^" + id + "$", "g")}, function (err, user) {

        if (err)
            console.error(err);

        if (callBack)
            callBack(err, user);

    });

}*/

/*ChattingRoomModel.prototype.findUsersbyInternalId = function (aryId, callBack) {

    var conditions = [];
    aryId.forEach(function (userId) {

        conditions.push({
            _id: userId
        });

    });

    var query = this.model.find({
        $or: conditions
    }).sort({'created': 1});

    query.exec(function (err, data) {

        if (err)
            console.error(err);

        if (callBack)
            callBack(err, data)

    });

},*/


    module["exports"] = new ChattingRoomModel();