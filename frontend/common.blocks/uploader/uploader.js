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
                formData.append('file', file);

                return formData;
            },

            _submitURL: '/uploads',

            _sendFile : function(formData){
                $.ajax({
                    url : this._submitURL,
                    type : 'POST',
                    data : formData,
                    cache : false,
                    dataType : 'json',
                    processData : false,
                    contentType : false,
                    success : function(data, textStatus, jqXHR){
                        console.log('success');
                        if(typeof data.error === 'undefined') {
                            //submitForm(event, data);
                        }
                        else {
                            console.log('ERRORS: ' + data.error);
                        }
                    },
                    error : function(jqXHR, textStatus, errorThrown){
                        console.log('ERRORS: ' + textStatus);
                    }
                });
            },

            _cancelUploading : function(reason){
                Notify.error(reason || 'Ошибка загрузки файла!');
                this.delMod('uploading');
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
