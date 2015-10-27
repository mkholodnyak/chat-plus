modules.define(
    'list',
    ['i-bem__dom', 'BEMHTML', 'jquery', 'i-chat-api', 'i-users', 'notify', 'events__channels', 'keyboard__codes', 'editable-title'],
    function(provide, BEMDOM, BEMHTML, $, chatAPI, Users, Notify, channels, keyCodes, EditableTitle, List){

        provide(List.decl({ modName : 'type', modVal : 'channels' }, {
            onSetMod : {
                'js' : {
                    'inited' : function(){
                        this._initialize();
                        this._initCreateNewChannelButton();
                    }
                }
            },

            _initializeLists : function(){
                this._getChannelsData();
            },

            _getChannelsData : function(){
                var _this = this;
                var generalChannelIndex;
                var hashChannelIndex;
                var selectedChannel;
                var items;
                chatAPI.get('channels.list')
                    .then(function(data){
                        var channelsList = data.channels.map(function(channel, index){
                            if(channel.is_general) {
                                generalChannelIndex = index;
                            }

                            if(channel.name == location.hash.slice(1)) {
                                generalChannelIndex = index;
                            }

                            return BEMHTML.apply({
                                block : 'list',
                                elem : 'item',
                                mods : { type : 'channels' },
                                content : channel.name,
                                js : {
                                    channelId : channel.id,
                                    name : channel.name,
                                    title : channel.topic.value
                                }
                            });
                        });

                        BEMDOM.update(_this._container, channelsList);

                        items = _this._container.children();
                        selectedChannel = items[hashChannelIndex || generalChannelIndex];

                        if(selectedChannel) {
                            selectedChannel.click();
                        }
                    })
                    .catch(function(){
                        Notify.error('Ошибка получения списка каналов!');
                    })
                    .always(function(){
                        _this._spinBlock.delMod('visible');
                    });
            },

            _initCreateNewChannelButton : function(){
                this._createChannelButton = this.findBlockInside('button');
                this._createChannelInput = this.findBlockInside('add-channel-input', 'input');

                this._createChannelButton.on('click', function(){
                    this.toggleMod(this.elem('add-channel-input'), 'visible');
                    this._createChannelInput.setMod('focused');

                    this.toggleMod(this.elem('addition'), 'open');
                }, this);

                this._createChannelInput.domElem.on('keydown', function(e){
                    if(e.keyCode === keyCodes.ENTER) {
                        e.preventDefault();
                        this._createChannel(e.target.value);
                    }
                }.bind(this));
            },

            _createChannel : function(){
                var channelName = this._createChannelInput.getVal();
                if(!channelName.length) {
                    return Notify.error('Введите название канала!');
                }

                this._spinBlock.setMod('visible');
                this.delMod(this.elem('add-channel-input'), 'visible');
                var _this = this;
                chatAPI.post('channels.create', { name : channelName })
                    .then(function(response){
                        Notify.success('Канал успешно создан!');
                        _this._createChannelInput.setVal('');
                        _this.dropElemCache('item');
                        _this._initializeLists();
                    })
                    .catch(function(err){
                        switch(err) {
                            case 'name_taken':
                                Notify.error('Такое имя канала уже существует!');
                                break;
                            case 'restricted_action':
                                Notify.error('Вам запрещено создавать новые каналы!');
                                break;
                            case 'no_channel':
                                Notify.error('Имя канала не может быть пустым и должно состоять из букв и цифр!');
                                break;
                            default:
                                Notify.error('Ошибка создания канала!');
                        }
                    })
                    .always(function(){
                        _this._spinBlock.delMod('visible');
                        _this.setMod(_this.elem('add-channel-input'), 'visible');
                    });
            }
        }));
    }
);
