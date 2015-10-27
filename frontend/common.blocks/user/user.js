modules.define('user', ['i-bem__dom', 'BEMHTML'],
    function(provide, BEMDOM, BEMHTML){
        provide(BEMDOM.decl(this.name, {
                onSetMod : {
                    'js' : {
                        'inited' : function(){
                            this.bindTo('click', this._onUserClick);
                        }
                    },
                    'presence' : {
                        '*' : function(){
                            var pageBlock = this.findBlockOutside('page');
                            var dialogControlBlock = pageBlock.findBlockInside('dialog-controls');
                            var callButton = dialogControlBlock.findElem('call');
                            if(this.hasMod('presence', 'local')) {
                                dialogControlBlock.delMod(callButton, 'disabled');
                            } else {
                                dialogControlBlock.setMod(callButton, 'disabled');
                            }
                        }
                    }
                },
                _onUserClick : function(){
                    var userParams = this.params;
                    userParams.presence = this.getMod('presence');
                    this.emit('click', userParams);
                }
            },
            {
                render : function(user, mods){
                    return BEMHTML.apply({
                            block : 'user',
                            js : {
                                id : user.id
                            },
                            mods : mods || {},
                            user : {
                                name : user.name,
                                realName : user.real_name,
                                image_48 : user.profile.image_48
                            }
                        }
                    );
                }
            }
        ));
    }
);
