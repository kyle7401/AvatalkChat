var $ = require('jquery');
var _ = require('lodash');
var U = require('../../../libs/utils.js');
var template = require('./NewGroup.hbs');
var Settings = require('../../../libs/Settings');
var Cookies = require('js-cookie');
var Const = require('../../../consts.js');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var LocalizationManager = require('../../../libs/localizationManager.js');

var NewGrpDialog = {

    step: 1,
    gubun: null,
    title: null,
    // usersCollection: null,
    // userTemplate: null,
    tblColletion: null,
    TablesCollection: null,
    member_id: null,
    parent: null,

    show: function (title, parent, text, onRetry) {

        var self = this;

        self.parent = parent;
        self.step = 1;

        $('body').append(template(/*{
         title: title,
         text: text
         }*/));

        $('#modal1').on('hidden.bs.modal', function (e) {
            $('#modal1').remove();
        });

        $('#modal1').modal('show');

        $('#modal-btn-close').on('click', function () {
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

        $('#modal-btn-ok').on('click', function () {
            self.next();
        });

        // 로그인한 사용자의 사용자 목록
        var TableModel = Backbone.Model.extend({
            defaults: {
                selected: false
            }
        });

        self.TablesCollection = Backbone.Collection.extend({
            model: TableModel
        });

        var loginInfo = Cookies.getJSON(Const.COOKIE_KEY_LOGININFO);
        self.member_id = loginInfo.id;

        self.refreshUsers();
    },
    hide: function (onFinish) {

        $('#modal1').on('hidden.bs.modal', function (e) {

            $('#modal1').remove();

            if (!_.isUndefined(onFinish)) {
                onFinish();
            }

        })

        $('#modal1').modal('hide');

    },

    next: function () {
        var self = this;

// alert('OK '+ self.step);

        switch (self.step) {
            case 1:
                if (self.validate1()) {
//alert($('#input-grpname').val());
                    self.title = $('#input-grpname').val();

                    self.gubun = $('input:radio[name=rdoGubun]:checked').val();
                    $('#div1').hide();
                    $('#div2').show();
                    self.listUsers();

                    self.step += 1;
                }

// alert(self.gubun);
                break;

            case 2:
                // default:
                var selected = self.tblColletion.where({
                    selected: true
                });

                if (selected.length <= 0) {
                    alert('대화상대를 선택해 주세요!');
                    return;
                }

                var members = [];
                // var iCount = 0; // 대화상대에 본인이 없다면 본인도 추가

                for (var i = 0; i < selected.length; i++) {
                    var id = selected[i].id;
                    console.log(i + ' = ' + id);
                    members.push(id);
                    //if(id == self.member_id) ++ iCount;
                }

                members.push(self.member_id);

                var chatRoom = {
                    "division": self.gubun,
                    "title": self.title,
                    "moderators": self.member_id,
                    "members": members
                };

                Backbone.ajax({
                    type: "POST",
                    // method: 'PATCH',
                    url: Settings.options.adminBaseUrl + '/api/chat/make',
                    dataType: 'json',
                    data: JSON.stringify(chatRoom),
                    contentType: "application/json; charset=UTF-8",
                    // headers: header,
                    success: function (response) {
                        // alert(response);
                        // U.goPage('main');
                        self.parent.refreshRooms();
                        self.hide();
                    },
                    error: function (e) {
                        if (JSON.parse(e.responseText)['result']) {
                            alert(JSON.parse(e.responseText)['result']);
                        } else {
                            alert(e);
                        }
                    }
                    /*statusCode: {
                     404: function () {
                     ErrorDialog.show('비밀번호 재설정', '이메일및 전화번호와 일치하는 정보를 찾을수 없습니다.');
                     },
                     500: function () {
                     ErrorDialog.show('비밀번호 재설정', '비밀번호 재설정중 에러가 발생 하였습니다.');
                     }
                     }*/
                });

                break;
        }
    },

    validate1: function () {
        var result = true;

        var grpname = $('#input-grpname');

        $('.form-group').removeClass('has-error');
        $('.label-error').text("");

        if (_.isEmpty(grpname.val())) {
            result = false;

            grpname.parent().find('.label-error').text(LocalizationManager.localize('Please enter a group name!'));
            grpname.parent().addClass('has-error');
        }

        return result;
    },

    // 로그인한 사용자의 사용자 목록
    refreshUsers: function () {
        var self = this;

        Backbone.ajax({
            type: "GET",
            url: Settings.options.adminBaseUrl + '/api/friend/list?member_id=' + self.member_id,
            dataType: 'json',
            contentType: "application/json; charset=UTF-8",
            // headers: header,
            success: function (data) {

                var users = [];

                for (var i = 0; i < data.length; i++) {
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
// alert(users.length);
                // self.test1();

                // hide processing which appears before login
                // ProcessingDialog.hide();
            }/*,
             statusCode: {
             500: function () {
             ErrorDialog.show('새 그룹 만들기', '사용자 목록 확인중 에러가 발생 하였습니다.');
             }
             }*/
        });
    },

    listUsers: function () {
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
    }
}

module.exports = NewGrpDialog;