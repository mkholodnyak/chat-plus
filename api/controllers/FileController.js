/**
 * FileController
 *
 * @description :: Server-side logic for managing files
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var fs = require('fs');
var gm = require('gm').subClass({ imageMagick : true });
var path = require('path');
var crypto = require('crypto');
var yandexDiskAPI = require('./../services/yadisk');

module.exports = {

    /**
     * `FileController.upload()`
     */
    upload : function(req, res){
        var _this = this;
        req.file('content').upload({
            dirname : 'uploads/'
        }, function(err, uploadedFiles){
            if(err) {
                return res.negotiate(err);
            }

            if(uploadedFiles.length === 0) {
                return res.badRequest('Файл не был загружен на сервер!');
            }

            var file = uploadedFiles[0];
            var filename = file.fd;
            var uploadName = _this._generateFilename(file.filename);

            console.log({
                filename : filename,
                uploadName : uploadName
            });

            yandexDiskAPI.upload(filename, uploadName)
                .then(function(link){
                    return res.json({
                        status : true,
                        link : link
                    });
                })
                .catch(function(err){
                    console.error(err);
                    return res.json({
                        status : false,
                        error : err.message
                    });
                });
        });
    },

    _generateFilename : function(fileName){
        //var extension = path.extname(fileName);
        //var file = path.basename(fileName, extension);
        return this._generateRandomString(10) + '_' + fileName;
    },

    _generateRandomString : function(charactersCount){
        charactersCount = +charactersCount || 10;
        return crypto.randomBytes(charactersCount).toString('hex');
    },

    /**
     * `FileController.download()`
     */
    download : function(req, res, next){

        // TODO: fix this:
        if(req.param('id') === 'undefined') {
            return next();
        }

        // Get image's path
        var uploadDir = sails.config.fileUpload.uploadDir;
        var filePath = path.resolve(uploadDir, req.param('id'));

        if(!fs.existsSync(filePath)) {
            return next();
        }

        var filePathWithSize;

        // Get required image size
        var height = req.query.h || null;
        var width = req.query.w || null;

        // h_0000_w_0000_
        var sizeNamePart = (
                height ? (
                'h_' + height + '_') : '') + (
                width ? 'w_' + width + '_' : '');

        filePathWithSize = path.resolve(uploadDir, sizeNamePart + req.param('id'));

        // If image with required size isn't present
        if(!fs.existsSync(filePathWithSize)) {
            gm(filePath)
                .resize(width, height)
                .write(filePathWithSize, function(err){
                    if(err) {
                        next(err);
                    }

                    res.sendfile(filePathWithSize);
                });
        } else {
            res.sendfile(filePathWithSize);
        }
    },

    getStatic : function(req, res, next){
        var file = req.param('file');
        var directory = req.param('directory');

        // TODO: fix this:
        if(file === 'undefined') {
            return next();
        }

        var filePath = path.resolve(__dirname, sails.config.fileUpload.staticDir, directory, file);

        if(fs.existsSync(filePath)) {
            res.sendfile(filePath);

        } else {
            next();
        }

    }
};
