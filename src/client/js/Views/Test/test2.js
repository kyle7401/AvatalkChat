var $ = require('jquery');
var _ = require('lodash');
var U = require('../../libs/utils.js');
var template = require('./test2.hbs');
var Settings = require('../../libs/Settings');
var Cookies = require('js-cookie');
var Const = require('../../consts.js');
var Backbone = require('backbone');
// Backbone.Marionette = require('backbone.marionette');
var Marionette = require('backbone.marionette');

// ====================================================================

var TestView = Backbone.View.extend({

    el: null,
    usersCollection: null,
    userTemplate: null,
    tblColletion: null,
    TablesCollection: null,

    initialize: function (options) {
        this.el = options.el;
        this.render();
    },

    render: function () {

        $(this.el).html(template());

        this.onLoad();

        return this;

    },

    onLoad: function () {
        var self = this;

        var TableModel = Backbone.Model.extend({
            defaults: {
                selected: false
            }
        });

        self.TablesCollection = Backbone.Collection.extend({
            model: TableModel
        });

        // 로그인한 사용자의 사용자 목록
        self.userTemplate = require('../Modals/NewGroup/cellUser.hbs');
        self.refreshUsers();
        // self.test1();

        $('#btn-enter').on('click', function () {
            var selected = self.tblColletion.where({
             selected: true
             });

            if(selected.length <= 0) {
                alert('사용자를 선택해 주세요!');
            } else {
                for(var i=0; i<selected.length; i++) {
                    console.log(i +' = '+ selected[i].id);
                }
            }
        });
    },

    test1: function () {
        /*var TableModel = Backbone.Model.extend({
            defaults: {
                selected: false
            }
        });

        var TablesCollection = Backbone.Collection.extend({
            model: TableModel
        });*/

        var LayoutView = Marionette.LayoutView.extend({
            initialize: function () {
            },
            el: '.container',
            regions: {
                tables: ".tables"
            }
        });

        var TablesItemView = Marionette.LayoutView.extend({
            tagName: "tr",
            attributes: function () {
                return {
                    "data-id": this.model.id
                }
            },
            template: function (model) {
                // return _.template('<td><%=name%></td><td><div class="actions"></div></td>')(model);
                return _.template('<td><img src="<%=avatarURL%>"></td></td><td><%=nick_name%></td>')(model);
            },
            /*regions: {
             actions: ".actions"
             },*/
            modelEvents: {
                "change:selected": "onSelected"
            },
            onSelected: function () {
                this.$el.toggleClass('active');
                /*if (this.model.get('selected')) {
                 this.showActions();
                 } else {
                 this.hideActions();
                 }*/
            }/*,
             showActions: function () {
             this.showChildView('actions', new ActionsView({
             model: this.model
             }));
             },
             hideActions: function () {
             this.getRegion('actions').reset();
             }*/
        });
        var TablesListView = Backbone.Marionette.CollectionView.extend({
            className: 'table',
            tagName: 'table',
            childView: TablesItemView,
            events: {
                'click': function (e) {
                    e.preventDefault();
                    var selected;
                    var $el = $(e.target);
                    var model = this.collection.get($el.parents('tr').data('id'));
                    model.set('selected', !model.get('selected'));
                    selected = this.collection.where({
                        selected: true
                    });

                    /*if (selected.length === 1) {
                     this.children.findByModel(selected[0]).showActions();
                     return;
                     }

                     if (selected.length > 1) {
                     this.children.each(function (childView) {
                     childView.hideActions();
                     })
                     }*/
                }
            }
        });

        /*var ActionsView = Backbone.Marionette.ItemView.extend({
         template: "#actions-template",
         events: {
         "click": "onAction"
         },
         onAction: function (e) {
         return false;
         }
         });*/

        var layout = new LayoutView();

        var self = this;
        // self.tblColletion = new TablesCollection(tables);

        layout.showChildView("tables", new TablesListView({
            // collection: new TablesCollection(tables)
            // collection: new TablesCollection(self.users)
            collection: self.tblColletion
        }));

        /*var selected = layout.collection.where({
            // selected: true
            selected: false
        });

        console.log('selected.length = '+ selected.length);*/
    },

    // 로그인한 사용자의 사용자 목록
    refreshUsers: function () {
        var self = this;
        var loginInfo = Cookies.getJSON(Const.COOKIE_KEY_LOGININFO);

        Backbone.ajax({
            type: "GET",
            url: Settings.options.adminBaseUrl + '/api/friend/list?member_id=' + loginInfo.id,
            dataType: 'json',
            contentType: "application/json; charset=UTF-8",
            // headers: header,
            success: function (data) {

                var users = [];

                for(var i=0; i<data.length; i++) {
                    var model = data[i];

                    if (model.member) {
                        users.push({
                            id: model.member.id,
                            nick_name: model.member.nick_name,
                            avatarURL: Settings.options.adminBaseUrl + model.member.profile
                        });
                    }
                }

                self.tblColletion = new self.TablesCollection(users);

                self.test1();

                // hide processing which appears before login
                // ProcessingDialog.hide();
            }/*,
            statusCode: {
                500: function () {
                    ErrorDialog.show('새 그룹 만들기', '사용자 목록 확인중 에러가 발생 하였습니다.');
                }
            }*/
        });

    }
});

module.exports = TestView;
