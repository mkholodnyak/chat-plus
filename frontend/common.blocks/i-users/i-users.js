/**
 * @module i-users
 * @description Коллекция пользователей
 */

modules.define('i-users', ['i-chat-api', 'events__channels'],
    function(provide, chatAPI, channels){
        var BOT_PROFILE = {
            is_bot : true,
            name : 'slackbot',
            real_name : 'Бот',
            presence : 'active',
            profile : {
                image_32 : 'static/images/bot_32.png',
                image_48 : 'static/images/bot_48.png'
            }
        };

        var shrimingEvents = channels('shriming-events');

        var Users = {
            /**
             * Загружает данные пользователей
             *
             * @returns {Promise}
             */
            fetch : function(){
                var _this = this;
                this._users = {};

                return chatAPI.post('users.list').then(function(data){
                    if(data.members && data.members.length) {
                        data.members.forEach(function(member){
                            _this._users[member.id] = member;
                        });
                        shrimingEvents.emit('users-loaded');
                    }
                });
            },

            /**
             * Получает данные пользователя
             *
             * @param {String} id - id пользователя
             * @returns {Object}
             */
            getUser : function(id){
                if(!Object.keys(this._users).length) {
                    return {};
                }

                return this._users[id] || BOT_PROFILE;
            },

            /**
             * Отдает список всех пользователей чата
             *
             * @returns {{}|*}
             */
            getAll : function(){
                return this._users;
            }
        };

        provide(/** @exports */Users);
    }
);
