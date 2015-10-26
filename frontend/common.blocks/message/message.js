modules.define(
    'message',
    ['i-bem__dom', 'BEMHTML', 'i-users', 'moment_language_ru'],
    function(provide, BEMDOM, BEMHTML, Users, moment){
        provide(BEMDOM.decl(this.name, {
                onSetMod : {
                    js : {
                        inited : function(){
                            this._handleTimerHover();
                        }
                    }
                },


                _handleTimerHover : function(){
                    var time = this.findBlockInside(this.elem('time'), 'link');
                    var dropdown = this.findBlockOn(this.elem('time'), 'dropdown');
                    time.on({ modName : 'hovered', modVal:'*'}, function(){
                        dropdown.setMod('opened', time.getMod('hovered'));
                    }, this);
                }
            },
            {
                render : function(user, message){
                    var username = user ? (user.real_name || user.name) : 'Бот какой-то';
                    var text = this._parseSystemMessage(message.text);

                    return BEMHTML.apply(
                        {
                            block : 'message',
                            js : true,
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
                                    switcher : this._formatDate(message.ts),
                                    popup : {
                                        block : 'message',
                                        elem : 'time-full',
                                        content : this._formatDate(message.ts, true)
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

                _formatDate : function(date, fullDate){
                    // Преобразуем в UNIX Timestamp
                    date = moment(new Date(Math.round(date) * 1000));
                    return fullDate ? date.format('hh:mm, DD MMMM YY') : date.fromNow();
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

                    return message;
                }
            }
        ));
    });
