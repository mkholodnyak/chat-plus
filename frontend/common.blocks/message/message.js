modules.define(
    'message',
    ['i-bem__dom', 'BEMHTML', 'i-users', 'moment_language_ru', 'marked', 'parser_type_emoji', 'tick'],
    function(provide, BEMDOM, BEMHTML, Users, moment, marked, emojiParser, tick){
        provide(BEMDOM.decl(this.name, {
                onSetMod : {
                    js : {
                        inited : function(){
                            this._handleTimerHover();
                        }
                    },
                    recent : {
                        'true' : function(){
                            tick.on('tick', function(){
                                console.log('tick');
                            }).start();
                        }
                    }
                },


                _handleTimerHover : function(){
                    var time = this.findBlockInside(this.elem('time'), 'link');
                    var dropdown = this.findBlockOn(this.elem('time'), 'dropdown');
                    time.on({ modName : 'hovered', modVal : '*' }, function(){
                        dropdown.setMod('opened', time.getMod('hovered'));
                    }, this);
                }
            },
            {
                render : function(user, message){
                    var username = user ? (user.real_name || user.name) : 'Бот какой-то';
                    var text = this._parseSystemMessage(message.text);

                    var messageTime = this._convertTimeStampToDate(message.ts);
                    var isMessageRecent = this._isMessageRecent(messageTime);
                    return BEMHTML.apply(
                        {
                            block : 'message',
                            js : !isMessageRecent ? true : {
                                timestamp : message.ts
                            },
                            mix : [{ block : 'dialog', elem : 'message' }],
                            content : [
                                {
                                    block : 'avatar',
                                    user : {
                                        name : username,
                                        image_48 : user.profile.image_48
                                    },
                                    mods : { size : 'm' },
                                    mix : { block : 'message', elem : 'avatar' }
                                },
                                {
                                    elem : 'username',
                                    content : username
                                },
                                {
                                    block : 'dropdown',
                                    mix : { block : 'message', elem : 'time' },
                                    mods : { switcher : 'link', theme : 'islands', size : 'm' },
                                    switcher : this._formatDate(messageTime),
                                    popup : {
                                        block : 'message',
                                        elem : 'time-full',
                                        content : this._formatDate(messageTime, true)
                                    }
                                },
                                {
                                    elem : 'content',
                                    content : text
                                }
                            ]
                        }
                    );
                },

                /**
                 * Прошел ли с момента отправки сообщения 1 час.
                 */
                _isMessageRecent : function(time){
                    return moment().subtract(1, 'hours').diff(time) < 0;
                },

                _convertTimeStampToDate : function(date){
                    // Преобразуем в UNIX Timestamp и переводим в формат Moment JS
                    return moment(new Date(Math.round(date) * 1000));
                },

                _formatDate : function(date, needFulltime){
                    return needFulltime ? date.format('HH:mm, DD MMMM YY') : date.fromNow();
                },

                _parseSystemMessage : function(message){
                    var regexp = {
                        system : /<@(.*)\|(.*)>/g,
                        pm : /<@(.*)>/g
                    };

                    var matchSystem = regexp.system.exec(message);
                    var matchPm = regexp.pm.exec(message);

                    if(matchSystem) {
                        message = '@' + matchSystem[2] + message.replace(regexp.system, '');
                    } else if(matchPm) {
                        message = '@' + Users.getUser(matchPm[1]).name + message.replace(regexp.pm, '');
                    }

                    return emojiParser(marked(message));
                }
            }
        ));
    });
