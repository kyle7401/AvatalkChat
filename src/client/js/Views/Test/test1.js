var $ = require('jquery');
var _ = require('lodash');
var U = require('../../libs/utils.js');
var template = require('./test1.hbs');
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

        // 로그인한 사용자의 사용자 목록
        self.userTemplate = require('../Modals/NewGroup/cellUser.hbs');
        // self.refreshUsers();
        self.test1();
    },

    test1: function () {
        var tables = [{
            id: 1,
            name: "test"
        }, {
            id: 2,
            name: "test"
        }, {
            id: 3,
            name: "test"
        }, {
            id: 4,
            name: "test"
        }, {
            id: 5,
            name: "test"
        }, {
            id: 6,
            name: "test"
        }, {
            id: 7,
            name: "test"
        }, {
            id: 8,
            name: "test"
        }, {
            id: 9,
            name: "test"
        }, {
            id: 10,
            name: "test"
        }, {
            id: 11,
            name: "test"
        }, {
            id: 12,
            name: "test"
        }, {
            id: 13,
            name: "test"
        }, {
            id: 14,
            name: "test"
        }, {
            id: 15,
            name: "test"
        }];

        var TableModel = Backbone.Model.extend({
            defaults: {
                selected: false
            }
        });

        var TablesCollection = Backbone.Collection.extend({
            model: TableModel
        });

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
                return _.template('<td><%=name%></td>')(model);
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

        layout.showChildView("tables", new TablesListView({
            collection: new TablesCollection(tables)
        }));
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
                self.usersCollection = data;

                $('#user-list').empty();

                self.usersCollection.forEach(function (model, index) {
                    if (model.member) {
                        model.id = model.member.id;
                        model.nick_name = model.member.nick_name;
                        model.avatarURL = Settings.options.adminBaseUrl + model.member.profile;
                        $('#user-list').append(self.userTemplate(model));
                    }
                });

                // hide processing which appears before login
                // ProcessingDialog.hide();
            },
            statusCode: {
                /*404: function () {
                 ErrorDialog.show('인증번호 확인', '인증번호가 일치하지 않습니다.');
                 },*/
                500: function () {
                    ErrorDialog.show('새 그룹 만들기', '사용자 목록 확인중 에러가 발생 하였습니다.');
                }
            }
        });

    }
});

module.exports = TestView;
