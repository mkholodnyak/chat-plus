modules.define(
    'dialog',
    ['i-bem__dom', 'BEMHTML', 'socket-io', 'i-chat-api', 'i-users', 'user', 'list',
        'message', 'keyboard__codes', 'jquery', 'notify', 'events__channels', 'functions__debounce'],
    function(provide, BEMDOM, BEMHTML, io, chatAPI, Users, User, List, Message, keyCodes, $, Notify, channels, debounce){
        var EVENT_METHODS = {
            'click-channels' : 'channels',
            'click-users' : 'im'
        };

        provide(BEMDOM.decl(this.name, {
            onSetMod : {
                'js' : {
                    'inited' : function(){
                        this._textarea = this.findBlockInside('textarea');
                        this._container = this.elem('container');

                        List.on('click-channels click-users', this._onChannelSelect, this);
                        User.on('click', this._onUserClick, this);

                        this._textarea.bindTo('keydown', this._onConsoleKeyDown.bind(this));
                        this.bindTo('history', 'wheel DOMMouseScroll mousewheel', this._onHistoryScroll.bind(this));
                        this._subscribeMessageUpdate();
                        this._handleMultilineInput();
                    }
                },
                loaded : {
                    'true' : function(){
                        this.elem('blank').show();
                    },

                    '' : function(){
                        this.elem('blank').hide();
                    }
                },

                loading : {
                    '*' : function(modName, modVal){
                        modVal ? this.setMod(this.elem('spin'), 'visible')
                            : this.delMod(this.elem('spin'), 'visible');
                    }
                },

                scrollable : {
                    'true' : function(){
                        BEMDOM.update(this.elem('button-down'), BEMHTML.apply({
                            block : 'button',
                            mods : { theme : 'islands', size : 's' },
                            mix : { block : 'dialog', elem : 'down' },
                            text : '↓ Вниз'
                        }));

                        this.findElem('down').on('click', function(){
                            this._scrollToLastMessage(true, 1000);
                        }.bind(this));
                    },
                    '' : function(){
                        this.elem('button-down').text('~ finale ~');
                    }
                }
            },
            
            destruct : function(){
                List.un('click-channels click-users');
            },

            _subscribeMessageUpdate : function(){
                var _this = this;
                var shrimingEvents = channels('shriming-events');
                var generatedMessage;

                chatAPI.on('message', function(e, data){
                    console.log(data);
                    if(_this._channelId && data.channel === _this._channelId) {
                        generatedMessage = _this._generateMessage(data);
                        BEMDOM.append(_this._container, generatedMessage);
                        _this._scrollToLastMessage(true, 300);
                    } else {
                        shrimingEvents.emit('channel-received-message', { channelId : data.channel });
                    }
                });
            },

            _onUserClick : function(e, userParams){
                var dialogControlBlock = this.findBlockInside('dialog-controls');
                var callButton = dialogControlBlock.findElem('call');

                if(userParams.presence != 'local') {
                    dialogControlBlock.setMod(callButton, 'disabled');
                    return;
                }

                dialogControlBlock.delMod(callButton, 'disabled');
                callButton.data('slackId', userParams.id);
            },

            _isInputClear : function(){
                return this._textarea.getVal().length === 0;
            },

            _restoreInputForChannel : function(){
                if(this._channelId) {
                    this._textarea.setVal(sessionStorage.getItem(this._channelId) || '');
                }
            },

            _saveInputForChannel : function(){
                if(!this._isInputClear()) {
                    sessionStorage.setItem(this._channelId, this._textarea.getVal());
                }
            },

            _handleMultilineInput : function(){
                this._textarea.on('change', function(){
                    var linesCount = (this._textarea.getVal().match(/\n/g) || []).length;

                    (linesCount > 0) ? this.setMod(this.elem('console'), 'type', 'multiline')
                        : this.delMod(this.elem('console'), 'type');
                }, this);

            },

            _onChannelSelect : function(e, data){
                this._saveInputForChannel();
                this.delMod('scrollable');
                this._textarea.setMod('disabled');

                this._channelId = data.channelId;
                this._channelType = EVENT_METHODS[e.type];
                this._tsOffset = 0;

                this.elem('name').text(data.name);
                this._joinToChannel(data.name);

                this.findBlockInside('editable-title')
                    .reset()
                    .setVal(this._channelId, data.title, (e.type === 'click-channels'));

                switch(e.type) {
                    case 'click-channels':
                        this.findBlockInside('dialog-controls').setMod('type', 'channels');
                        this.setMod(this.elem('name'), 'type', 'channels');

                        break;

                    case 'click-users':
                        this.findBlockInside('dialog-controls').setMod('type', 'user');
                        this.setMod(this.elem('name'), 'type', 'users');

                        break;

                    default:

                }

                BEMDOM.update(this._container, []);
                this.setMod('loading');
                this._restoreInputForChannel();
                this._getData();
            },

            _joinToChannel : function(channelName){
                chatAPI.post('channels.join', {
                    name : channelName
                });
            },

            _onHistoryScroll : debounce(function(e){
                if(this.getMod('loaded')) {
                    return;
                }

                var history = this.elem('history');

                if((e.type === 'wheel' || e.type === 'DOMMouseScroll' || e.type === 'mousewheel') && history.scrollTop() === 0) {
                    this.setMod('loading', true);
                    this._getData(true);
                }
            }, 100),

            _markChannelRead : function(timestamp){
                chatAPI.post(this._channelType + '.mark', {
                    channel : this._channelId,
                    ts : timestamp
                })
                    .then(function(data){
                        console.log('Channel mark: ', data);
                    })
                    .catch(function(err){
                        switch(err) {
                            case 'not_in_channel':
                                break;
                            default:
                                Notify.error('Ошибка при открытии канала!');
                        }
                    });
            },

            _MESSAGES_NUMBER_PER_REQEUST : 100,

            _getData : function(infiniteScroll){
                var _this = this;
                _this.delMod('loaded');
                this.elem('blank').hide();

                chatAPI.post(this._channelType + '.history', {
                    channel : this._channelId,
                    latest : infiniteScroll ? this._tsOffset : 0
                })
                    .then(function(resData){
                        var messages = resData.messages.reverse();
                        if(messages.length < _this._MESSAGES_NUMBER_PER_REQEUST) {
                            _this.setMod('loaded', true);
                        }
                        var messagesList = messages.map(function(message){
                            return _this._generateMessage(message);
                        });

                        if(messages.length) {
                            _this._markChannelRead(messages[messages.length - 1].ts);
                            _this._tsOffset = messages[0].ts;
                        } else {
                            _this.setMod('loaded', true);
                        }

                        if(infiniteScroll) {
                            var historyElement = _this.elem('history');
                            var oldHistoryHeight = historyElement[0].scrollHeight;

                            BEMDOM.prepend(_this._container, messagesList.join(''));
                            _this._preventScrollAfterPrepend(historyElement, oldHistoryHeight);
                        } else {
                            BEMDOM.update(_this._container, messagesList);
                            _this._scrollToLastMessage();
                        }

                        if(_this._textarea.getMod('disabled')) {
                            _this._textarea.delMod('disabled');
                        }
                    })
                    .catch(function(err){
                        console.error(err);
                        Notify.error('Ошибка загрузки списка сообщений!');
                    })
                    .always(function(){
                        _this.delMod('loading');
                    });
            },

            _generateMessage : function(message){
                var user = Users.getUser(message.user) || {};
                return Message.render(user, message);
            },

            _preventScrollAfterPrepend : function(elem, oldHeight){
                var newHistoryHeight = elem[0].scrollHeight;
                var newScrollTop = newHistoryHeight - oldHeight;
                if(newHistoryHeight > 0) {
                    this.setMod('scrollable');
                    elem.scrollTop(newScrollTop);
                }
            },

            /**
             * Прокручивает блок с сообщениями к последнему сообщению
             *
             * @private
             */
            _scrollToLastMessage : function(animate, time){
                var historyElement = this.elem('history');
                var historyElementHeight;

                if(historyElement.length) {
                    historyElementHeight = historyElement[0].scrollHeight;
                    if(animate) {
                        historyElement.animate({
                            scrollTop : historyElementHeight
                        }, time || 1000);
                    } else {
                        historyElement.scrollTop(historyElementHeight);
                    }
                }
            },

            _onConsoleKeyDown : function(e){
                if(e.keyCode === keyCodes.ENTER && !e.ctrlKey) {
                    e.preventDefault();

                    if(!this._textarea.hasMod('emoji')) {
                        if(this._isInputClear()) {
                            return;
                        }

                        this._sendMessage(e.target.value);
                        e.target.value = '';
                    }
                }
            },

            _sendMessage : function(message){
                var _this = this;
                if(!this._channelId) {
                    return;
                }

                chatAPI.post('chat.postMessage', {
                    text : message,
                    channel : _this._channelId,
                    username : _this.params.username,
                    unfurl_links : true,
                    unfurl_media : true,
                    as_user : true
                })
                    .then(function(){
                        _this.elem('blank').hide();
                    })
                    .catch(function(err){
                        console.error(err);
                        Notify.error('Ошибка при отправке сообщения!');
                    })
                    .always(function(){
                        console.log(_this._channelId);
                        sessionStorage.removeItem(_this._channelId);
                    });
            }
        }));
    }
);
