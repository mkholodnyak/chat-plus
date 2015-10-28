modules.define(
    'uploader',
    ['i-bem__dom', 'notify', 'jquery'],
    function(provide, BEMDOM, Notify, $){

        provide(BEMDOM.decl(this.name, {
            onSetMod : {
                js : {
                    inited : function(){
                        this._textarea = this.findBlockOn('textarea');
                        this._initDomEvent();
                    }
                },

                'drag-enter' : {
                    true : function(){
                        this._textarea.setMod('disabled', true);
                    },
                    '' : function(){
                        this._textarea.delMod('disabled');
                    }
                },

                'uploading' : {
                    true : function(){
                        this._textarea.setMod('disabled', true);
                    },
                    '' : function(){
                        this._textarea.delMod('disabled');
                        this._textarea.setVal('');
                    }
                }
            },

            _initDomEvent : function(){
                this.bindTo('dragenter', function(){
                    this.setMod('drag-enter', true);
                });

                this.bindTo('dragleave', function(){
                    this.delMod('drag-enter');
                });

                this.bindTo('drop change submit', this._handleDroppedFile.bind(this));
            },

            _handleDroppedFile : function(e){
                this.setMod('uploading', true);

                var file = (e.type === 'submit') ? e.target[0].files[0] : e.originalEvent.dataTransfer.files[0];
                if(!file) {
                    this._cancelUploading('Ошибка загрузки файла!');
                    return;
                }
                if(!this._checkFileSize(file)) {
                    this._cancelUploading('Файл слишком большой!');
                    return;
                }

                this._displayUploadingFileName(file.name);
                var formData = this._prepareFormData(file);
                this._sendFile(formData);
                return false;
            },

            _prepareFormData : function(file){
                var formData = new FormData();
                formData.append('content', file);

                return formData;
            },

            _submitURL : '/uploading',

            _sendFile : function(formData){
                var _this = this;

                $.ajax({
                    url : '/uploading',
                    data : formData,
                    processData : false,
                    cache : false,
                    contentType : false,
                    type : 'POST'
                })
                    .done(function(result){
                        if(!result.status) {
                            console.error(result.error);
                            _this._cancelUploading('Ошибка обработки файла!');
                            return;
                        }
                        _this._printLinkToFile(result.link);
                    })
                    .fail(function(err){
                        console.error(err);
                        _this._cancelUploading('Ошибка обработки файла!');
                    });
            },

            _cancelUploading : function(reason){
                Notify.error(reason || 'Ошибка загрузки файла!');
                this.delMod('uploading');
            },

            _printLinkToFile : function(link){
                Notify.success('Файл успешно загружен!');
                this.delMod('uploading');
                this._textarea.setVal(link);
            },

            // Пусть будет 10мб
            _maxFileSize : 10 * 1024 * 1024,

            _checkFileSize : function(file){
                return file.size < this._maxFileSize;
            },

            _displayUploadingFileName : function(filename){
                this._textarea.setVal('Загружается ' + filename + '...');
            }
        }));
    });
