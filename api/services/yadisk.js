var YandexDisk = require('yandex-disk').YandexDisk;
var vow = require('vow');
var path = require('path');

var login;
var password;

var credentials = sails.config.yandexDisk;
if(!credentials) {
    console.error('Необходимо ввести логин и пароль от Yandex API');
    login = '';
    password = '';
} else {
    login = credentials.login;
    password = credentials.password;
}

var disk = new YandexDisk(login, password);

var yandexDiskAPI = {
    upload : function(pathName, filename){

        return new vow.Promise(function(resolve, reject){
            disk.uploadFile(path.resolve(pathName), filename, function(err){
                if(err) {
                    return reject(err);
                }

                disk.publish(filename, function(err, result){
                    if(err) {
                        return reject(err);
                    }
                    resolve(result);
                });
            });

        });
    }
};

module.exports = yandexDiskAPI;
