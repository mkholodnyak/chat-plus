modules.define(
    'textcomplete',
    ['i-bem__dom', 'BEMHTML', 'jquery', 'emoji-icon__data', 'i-users', 'user', 'jquery__textcomplete'],
    function(provide, BEMDOM, BEMHTML, $, emojiData, Users, User, textcomplete){

        provide(BEMDOM.decl(this.name, {
            onSetMod : {
                js : {
                    inited : function(){
                        this._textarea = this.findBlockInside('textarea');
                        this._initializeTextCompleteStrategies();
                    }
                }
            },

            _emojiRegExp : /\B:([\-+\w]*)$/,
            _mentionRegExp : /\B@([\-+\w]*)$/,

            /**
             * Инициализирует плагин автодополнения emoji-иконок
             *
             * @private
             */
            _initializeTextCompleteStrategies : function(){
                var _this = this;

                this._textarea.domElem.textcomplete([
                    _this._getEmojiStrategy(),
                    _this._getMentionStrategy()
                ]).on({
                    'textComplete:hide' : function(){
                        _this._textarea.delMod('emoji');
                    }
                });
            },

            /**
             * Стратегия обработки emoji-автодополнения
             */
            _getEmojiStrategy : function(){
                var _this = this;

                return {
                    match : _this._emojiRegExp,

                    search : function(term, callback){
                        _this._textarea.setMod('emoji');
                        var shortnames = [];
                        var aliases = [];
                        var keywords = [];
                        $.each(emojiData, function(shortname, data){
                            if(shortname.indexOf(term) > -1) {
                                shortnames.push(shortname);
                            } else {
                                if((data.aliases !== null) && (data.aliases.indexOf(term) > -1)) {
                                    aliases.push(shortname);
                                }
                                else if((data.keywords !== null) && (data.keywords.indexOf(term) > -1)) {
                                    keywords.push(shortname);
                                }
                            }
                        });

                        if(term.length >= 3) {
                            shortnames.sort(_this._comparator);
                            aliases.sort(_this._comparator);
                            keywords.sort();
                        }
                        var newResults = shortnames.concat(aliases).concat(keywords);

                        callback(newResults);
                    },

                    template : function(shortname){
                        return BEMHTML.apply([
                            {
                                block : 'emoji-icon',
                                cls : 'emojione',
                                icon : emojiData[shortname].unicode,
                                shortname : shortname
                            },
                            ':' + shortname + ':'
                        ]);
                    },

                    replace : function(shortname){
                        return ':' + shortname + ': ';
                    },

                    index : 1,

                    maxCount : 10
                };
            },

            /**
             * Стратегия обработки @mention
             */
            _getMentionStrategy : function(){
                var _this = this;
                return {
                    match : _this._mentionRegExp,

                    search : function(term, callback){
                        var users = Users.getAll();
                        _this._textarea.setMod('emoji');
                        var nicknames = [];
                        var realNames = [];
                        $.each(users, function(userID, data){
                            if(data.name.indexOf(term) > -1) {
                                nicknames.push(userID);
                            } else {
                                if((data.real_name !== null) && (data.real_name.indexOf(term) > -1)) {
                                    realNames.push(userID);
                                }
                            }
                        });

                        if(term.length >= 3) {
                            nicknames.sort(_this._comparator);
                            realNames.sort(_this._comparator);
                        }
                        callback(nicknames.concat(realNames));
                    },

                    template : function(userID){
                        var user = Users.getUser(userID);
                        // Настоящее имя пользователя не выводим
                        user.real_name = '';
                        return User.render(user, { theme : 'light' });
                    },

                    replace : function(userID){
                        var user = Users.getUser(userID);
                        return '@' + (user.name || 'channel') + ' ';
                    },

                    index : 1,

                    maxCount : 5
                };
            },

            _comparator : function(a, b){
                return (a.length > b.length);
            }
        }));
    });
