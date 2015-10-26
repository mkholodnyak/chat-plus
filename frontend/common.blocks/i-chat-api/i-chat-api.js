/**
 * @module i-chat-api
 * @description Обеспечивает общение клиентской части чата и Slack RTM
 */

modules.define('i-chat-api', ['jquery', 'vow', 'eventemitter2', 'i-helper__function'],
    function(provide, $, vow, EventEmitter2, helper){

        var chatAPIPrototype = {
            /**
             * Совершает запрос к серверу Slack
             *
             * @param {String} action  Код метода в API Slack
             * @param {Object} params Передаваемые данные
             * @return {Promise} Promise ответа сервера
             */
            request : this.get,

            /**
             * Алиас к .request()
             */
            get : function(action, params){
                return this._request(action, params, 'get');
            },

            /**
             * Совершает POST-запрос к серверу Slack
             * ! API Slack позволяет использовать GET-запросы для
             * совершения любых операций.
             *
             * @param {String} action Код метода в API Slack
             * @param {Object} params Передаваемые данные
             * @return {Promise} Promise ответа сервера
             */
            post : function(action, params){
                return this._request(action, params, 'post');
            },

            /**
             * Аксессор к полю isOpen
             *
             * @param {Boolean} [isOpen]
             * @returns {Boolean} Статус соединения (открыто/закрыто)
             */
            isOpen : function(isOpen){
                if(arguments.length) {
                    return this._isOpen = isOpen;
                }

                return this._isOpen;
            },

            /**
             * Устанавливает новый токен пользователя
             * @param token
             */
            setToken : function(token){
                if(token.length) {
                    this._token = token;
                    this._sendDelayedRequests();
                    this._getSocketURL();
                }
            },

            _RTM_START_URL : 'https://slack.com/api/rtm.start',

            init : helper.once(function(token){
                this._token = token;
                this._setHandlers();
                this._getSocketURL();
            }),

            _setHandlers : function(){
                var events = this._internalEvents;
                for(var event in events) if(events.hasOwnProperty(event)) {
                    this.on(event, events[event]);
                }
            },

            _internalEvents : {
                // TODO: Решить с командой правильную обработку потери соединения
                '_connection-open' : function(){
                },
                '_connection-close' : function(response){
                    console.error('Socket.close');
                },
                '_connection-abort' : function(response){
                    console.error('Socket.abort');
                },
                '_connection-error' : function(error){
                    console.log('Socket.connection.error');
                }
            },

            _isOpen : false,

            _getSocketURL : function(){
                var _this = this;
                _this.post('rtm.start')
                    .then(function(result){
                        _this.emit('rtm.start', result);

                        if(!result.ok) {
                            throw new Error(result);
                        }

                        if(!result.url) {
                            throw  new Error('URL для создания socket-соединения не найден!');
                        }

                        _this.isOpen(true);
                        _this._initSocket(result.url);
                        _this._RTM_START_OBJECT = result;
                    })
                    .catch(function(error){
                        console.error(error);
                    });
            },

            _initSocket : function(url){
                var _this = this;
                this._socket = new WebSocket(url);

                this._socket.onopen = function(){
                    _this.emit('_connection-open');
                };

                this._socket.onclose = function(event){
                    var response = {
                        code : event.code,
                        reason : event.reason
                    };

                    _this.isOpen(false);
                    if(event.wasClean) {
                        _this.emit('_connection-close', response);
                    } else {
                        _this.emit('_connection-abort', response);
                    }
                };

                this._socket.onmessage = function(event){
                    var response = JSON.parse(event.data);
                    _this.emit(response.type, response);
                };

                this._socket.onerror = function(error){
                    _this.emit('_connection-error', error.message);
                };
            },

            _token : '',

            _SLACK_API_URL : 'https://slack.com/api/',

            _isTokenReady : function(){
                return this._token.length > 0;
            },

            _sendRequest : function(action, params, method){
                params = params || {};

                var _this = this;
                return new vow.Promise(function(resolve, reject){
                    $.extend(params, {token : _this._token});
                    $.post(_this._SLACK_API_URL + action, params)
                        .done(function(resData){
                            if(!resData || resData.error) {
                                reject(resData.error || 'Ошибка подключения к API');
                            }
                            resolve(resData);
                        })
                        .fail(function(err){
                            reject(err);
                        });
                });
            },

            _delayedRequests : [],

            _addDelayedRequest : function(action, params, method){
                this._delayedRequests.push({
                    action : action,
                    params : params,
                    method : method
                });
            },

            _sendDelayedRequests : function(){
                var _this = this;
                _this._delayedRequests.forEach(function(request){
                    _this._request(request.action, request.params, request.method);
                });
                _this._delayedRequests = [];
            },

            _request : function(action, params, method){
                method = method || 'get';
                if(!this._isTokenReady()) {
                    this._addDelayedRequest(action, params, method);
                    return new vow.Promise.reject('Token not found!');
                }

                return this._sendRequest(action, params, method);
            }
        };

        var chatAPI = $.extend({}, chatAPIPrototype, new EventEmitter2({
            wildcard : true
        }));

        provide(chatAPI);
    });
