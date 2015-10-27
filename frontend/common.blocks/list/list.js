modules.define(
    'list',
    ['i-bem__dom', 'BEMHTML', 'jquery', 'i-chat-api', 'i-users', 'notify', 'events__channels', 'keyboard__codes', 'editable-title', 'functions__throttle'],
    function(provide, BEMDOM, BEMHTML, $, chatAPI, Users, Notify, channels, keyCodes, EditableTitle, throttle){

        provide(BEMDOM.decl(this.name, {
            onSetMod : {
                'js' : {
                    'inited' : function(){
                        this._initialize();
                    }
                }
            },

            _initialize : function(){
                var instances = this.__self.instances || (
                        this.__self.instances = []);
                instances.push(this);

                this._container = this.elem('container');

                this._spinBlock = this.findBlockInside('spin');
                if(this._spinBlock) {
                    this._spinBlock.setMod('visible');
                }

                var shrimingEvents = channels('shriming-events');

                shrimingEvents.on('users-loaded', this._initializeLists, this);
                shrimingEvents.on('channel-received-message', this._handleNewMessage, this);
                EditableTitle.on('channel-change-title', this._onChannelChangeTitle, this);
            },

            _handleNewMessage : function(e, data){
                var counter = this._getItemCounter(data.channelId);

                if(counter) {
                    counter.text(Number(counter.text()) + 1);
                }

                this.dropElemCache('item');
            },

            /**
             * Получаем каналы и итерируемся по каждому с целью
             * простановки счетчика непрочитнных сообщений
             *
             * @param {String} channelId - ID канала
             * @returns {Object|null} - Элемент counter счетчика непрочитанных сообщений канала
             *
             * @private
             */
            _getItemCounter : function(channelId){
                var _this = this;
                var counterElem;

                this.elem('item').each(function(index, item){
                    // Получаем параметры канала
                    var itemParams = _this.elemParams($(item));

                    // Если id итерируемого канала равен channelId
                    if(itemParams.channelId === channelId) {
                        counterElem = $(_this.findElem('counter')[index]);
                    }
                });

                return counterElem ? counterElem : null;
            },

            _onItemClick : function(e){
                var item = $(e.currentTarget);
                if(this.getMod(item, 'current')) {
                    return;
                }

                var type = this.getMod(item, 'type');
                var counter = this._getItemCounter(this.elemParams(item).channelId);

                if(type == 'channels') {
                    location.hash = e.target.innerText;
                }

                if(counter) {
                    counter.text('');
                }

                this.__self.instances.forEach(function(list){
                    list.delMod(list.elem('item'), 'current');
                });

                this.setMod(item, 'current', true);
                this.emit('click-' + type, this.elemParams(item));
                this.dropElemCache('item');
            },

            _onChannelChangeTitle : function(e, data){
                var currentItem = $(this.elem('item_current'));

                if(!currentItem.length) {
                    return;
                }

                var params = $.extend({}, this.elemParams(currentItem));
                params.title = data.newTitle;

                BEMDOM.replace(currentItem, BEMHTML.apply({
                    block : 'list',
                    elem : 'item',
                    mods : { type : 'channels', current : true },
                    content : params.name,
                    js : params
                }));

                this.dropElemCache('item');
            }
        }, {
            live : function(){
                this.liveBindTo('item', 'click', function(e){
                    this._onItemClick(e);
                });

                return false;
            }
        }));
    }
);
