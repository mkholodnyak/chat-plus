modules.define(
    'list',
    ['i-bem__dom', 'BEMHTML', 'jquery', 'i-chat-api', 'i-users', 'notify', 'events__channels', 'keyboard__codes', 'editable-title', 'user'],
    function(provide, BEMDOM, BEMHTML, $, chatAPI, Users, Notify, channels, keyCodes, EditableTitle, User, List){

        provide(List.decl({ modName : 'type', modVal : 'users' }, {
            _initializeLists : function(){
                var _this = this;

                chatAPI.on('connection-ready', function(e, result){
                    var usersStatusOnStart = {};

                    result.users.forEach(function(user){
                        usersStatusOnStart[user.id] = user.presence;
                    });

                    _this._getUsersData(usersStatusOnStart);
                });
            },

            _getUsersData : function(usersStatusOnStart){
                var _this = this;
                var pageBlock = this.findBlockOutside('page');

                chatAPI.get('im.list')
                    .then(function(data){
                        var imsList = data.ims.map(function(im){
                            var user = Users.getUser(im.user);

                            if(!user) {
                                return;
                            }

                            var presence = usersStatusOnStart[user.id];
                            if(presence) {
                                user.presence = usersStatusOnStart[user.id];
                            }

                            var userBlock = User.render(user, { presence : user.presence });
                            return BEMHTML.apply({
                                block : 'list',
                                elem : 'item',
                                mods : { type : 'users' },
                                js : {
                                    channelId : im.id,
                                    name : user.name,
                                    title : user.real_name
                                },
                                content : userBlock
                            });
                        });

                        BEMDOM.update(_this._container, imsList);
                        updateUsersStatus('activeUsersUpdated', pageBlock._activeUsersUpdated);
                    })
                    .catch(function(err){
                        console.error(err);
                        Notify.error('Ошибка получения списка приватных бесед');
                    })
                    .always(function(){
                        _this._spinBlock.delMod('visible');
                    });

                function updateUsersStatus(name, data){
                    _this.findBlocksInside('user').forEach(function(user){
                        switch(name) {
                            case 'activeUsersUpdated':
                                if(data[user.params.id]) {
                                    user.setMod('presence', 'local');
                                } else if(user.hasMod('presence', 'local')) {
                                    chatAPI.get('users.getPresence', { user : user.params.id }).then(function(data){
                                        if(data.ok) {
                                            user.setMod('presence', data.presence);
                                        }
                                    });
                                }
                                break;
                            case 'presence_change':
                                if(user.params.id == data.user && !user.hasMod('presence', 'local')) {
                                    user.setMod('presence', data.presence);
                                }
                                break;
                        }
                    });
                }

                pageBlock.on('activeUsersUpdated', function(e, data){
                    updateUsersStatus('activeUsersUpdated', data);
                });

                chatAPI.on('presence_change', function(e, data){
                    updateUsersStatus('presence_change', data);
                });
            }

        }));
    }
);
