/**
 * @module Editable-input
 */

modules.define(
    'editable-title',
    ['i-bem__dom', 'i-chat-api', 'keyboard__codes', 'notify'],
    function(provide, BEMDOM, chatAPI, keyCodes, Notify){

        /**
         * @exports
         * @class editable-input
         */
        provide(BEMDOM.decl(this.name, {
            onSetMod : {
                'js' : {
                    'inited' : function(){
                        this._title = this.elem('title');
                        this._input = this.elem('input');
                        this._spin  = this.elem('spin');
                    }
                },
                'active' : function(modName, modVal){
                    if(modVal){
                        this.findBlockInside('input').bindTo('keydown', this._handleInputKeyDown.bind(this));
                        this._title.on('click', this._handleTitleClick.bind(this));
                    }else{
                        this._title.off('click');
                        this.findBlockInside('input').unbindFrom('keydown');
                    }
                }
            },

            /**
             * Устанавливает значение для заголовка
             *
             * @param {String} value - Значение заголовка
             * @param {Boolean} isActive - Делать ли заголовок изменяемым при клике
             * @returns {Object}
             */
            setVal : function(channelId, value, isActive){
                if(!value && isActive){
                    value = 'Без названия';
                    this.setMod('empty');
                }else{
                    this.delMod('empty');
                }

                this.setMod('active', isActive);
                this._title.text(value);
                this._channelId = channelId;

                return this;
            },

            /**
             * Обнуляет состояние блока
             *
             * @returns {Object}
             */
            reset : function(){
                this._input
                    .val('')
                    .hide();

                this._title
                    .text('')
                    .show();

                return this;
            },

            /**
             * Обработка клика на заголовке
             *
             * @private
             */
            _handleTitleClick : function(){
                this._input.show();
                this._title.hide();

                this._input.find('input')
                    .val(this._title.text())
                    .focus();
            },

            /**
             * Обработка нажатия на клавиши при фокусе в инпуте
             *
             * @param {Event} e - объект события
             * @private
             */
            _handleInputKeyDown : function(e){
                var value = e.target.value;

                if(e.keyCode === keyCodes.ENTER && this._validateInput(value)){
                    this._saveTitle(value);
                }
            },

            /**
             * Валидация инпута, при ошибке показывается Notify
             *
             * @param {String} value - Новое значение заголовка
             * @returns {boolean} - Результат валидации инпута
             * @private
             */
            _validateInput : function(value){
                if(value){
                    this.delMod(this._input, 'error');
                }else{
                    this.setMod(this._input, 'error');
                    Notify.info('Введите тему канала');
                }

                return Boolean(value);
            },

            /**
             * Метод для сохранения нового значения названия заголовка
             *
             * @param {String} value - Новое значение заголовка
             * @private
             */
            _saveTitle : function(value){
                var _this = this;

                this.findBlockInside('input').setMod('disabled');
                this._input.hide();
                this.setMod(this._spin, 'visible');

                chatAPI.post('channels.setTopic', {
                    channel : this._channelId,
                    topic : value
                })
                    .then(function(resData){
                        var newTitle = resData.topic;

                        if (newTitle){
                            _this._title.text(newTitle);
                            _this.delMod('empty');
                            _this.emit('channel-change-title', { newTitle : newTitle });
                        }
                    })
                    .catch(function(err){
                        console.error(err);
                        Notify.error('Ошибка изменения темы канала');
                    })
                    .always(function(){
                        _this._title.show();
                        _this.delMod(_this._spin, 'visible');
                        _this.findBlockInside('input').delMod('disabled');
                    });
            }
        }));
    }
);
