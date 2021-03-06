modules.define('page', ['i-bem__dom', 'i-chat-api', 'socket-io', 'i-users', 'notify'],
    function(provide, BEMDOM, chatAPI, io, Users, Notify){
        provide(BEMDOM.decl(this.name, {
            onSetMod : {
                'js' : {
                    'inited' : function(){
                        var _this = this;

                        io.socket = io.sails.connect();

                        io.socket.on('connect', function(){
                            io.socket.get('/webrtc/connected');
                        });

                        io.socket.on('activeUsersUpdated', function(users){
                            console.log('Active users: ', users);
                            _this._activeUsersUpdated = users;
                            _this.emit('activeUsersUpdated', users);
                        });

                        if(!chatAPI.isOpen()) {
                            chatAPI.init(_this.params.token);
                        }

                        Users.fetch()
                            .catch(function(err){
                                console.error(err);
                                Notify.error('Ошибка загрузки списка пользователей!');
                            });
                        _this.emit('slackInited');

                        this._preventDropEvents();

                    }
                }
            },

            _preventDropEvents : function(){
                this.bindTo('dragover dragenter dragleave drop', function(e){
                    e.preventDefault();
                    e.stopPropagation();
                });
            }
        }));
    }
);
