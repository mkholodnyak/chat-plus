modules.define(
    'textcomplete',
    ['i-bem__dom', 'BEMHTML', 'jquery', 'emoji-icon__data', 'jquery__textcomplete'],
    function(provide, BEMDOM, BEMHTML, $, emojiData){

        provide(BEMDOM.decl(this.name, {
            onSetMod : {
                js : {
                    inited : function(){
                        this._initTextCompletePlugin();
                    }
                }
            },

            /**
             * Инициализирует плагин автодополнения emoji-иконок
             *
             * @private
             */
            _initTextCompletePlugin : function(){
                var _this = this;
                this._textarea = this.findBlockInside('textarea');

                // Код из примера работы плагина
                this._textarea.domElem.textcomplete([{
                    match : /\B:([\-+\w]*)$/,
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
                            var comparator = function(a, b){
                                return (a.length > b.length);
                            };

                            shortnames.sort(comparator);
                            aliases.sort(comparator);
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
                }]).on({

                    'textComplete:hide' : function(){
                        _this._textarea.delMod('emoji');
                    }
                });
            }
        }));
    });
