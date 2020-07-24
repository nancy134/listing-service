const fs = require('fs');
const AWS = require('aws-sdk');
const models = require("./models")
const listingService = require("./listing");
const listingVersionService = require("./listingVersion");
const listingAPIService = require("./listingAPI");
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

var index = function(page, limit, offset, where){
    return new Promise(function(resolve, reject){
        models.Image.findAndCountAll({
            where: where,
            limit: limit,
            offset: offset,
            attributes: ['id', 'order', 'url']
        }).then(images => {
            var ret = {
                page: page,
                perPage: limit,
                images: images
            }
            resolve(ret);
        }).catch(err => {
            reject(err);
        });
    });
}


exports.getImages = function(page, limit, offset, where){
    return new Promise(function(resolve, reject){
        index(page, limit, offset, where).then(function(images){
            resolve(images);
        }).catch(function(err){
            reject(err);
        });
    });
}

var uploadFile = function(path,fileName,table,tableIndex,imageIndex){
    return new Promise(function(resolve, reject){
        var filePath = "./"+path;
        fs.readFile(filePath, (err, data) => {
            if (err){
                reject(err);
            }
            var key = 
                table + "/" +
                tableIndex + "/" +
                'image' + "/" +
                imageIndex + "/" +
                fileName;
                 
            const params = {
                Bucket: process.env.S3_BUCKET, 
                Key: key, 
                Body: data
            };
            s3.upload(params, function(s3Err, data) {
                if (s3Err) {
                    reject(s3Err);
                } else {
                    resolve(data);
                }
            });
        });
    });
}

var find = function(id, t){
    return new Promise(function(resolve, reject){
        models.Image.findOne({
            where: {
                id: id
            },
            transaction: t
        }).then(function(image){
            resolve(image);
        }).catch(function(err){
            reject(err);
        });
    });
}

var findWithPrevious = function(id, t){
    return new Promise(function(resolve, reject){
        models.Image.findOne({
            where: {
                PreviousVersionId: id
            },
            transaction: t
        }).then(function(image){
            resolve(image);
        }).catch(function(err){
            reject(err);
        });
    });
}

var create = function(body, t){
    return new Promise(function(resolve, reject){
        models.Image.create(body, {transaction: t}).then(function(image){
            resolve(image);
        }).catch(function(err){
            reject(err);
        });
    }); 
}
var updateImage = function(id, body, t){
    return new Promise(function(resolve, reject){
        models.Image.update(
            body,
            {
                returning: true,
                where: {id: id},
                transaction: t
            }
        ).then(function([rowsUpdate, [image]]){
            resolve(image);
        }).catch(function(err){
            reject(err);
        });
    });
}

var deleteImage = function(id, t){
    return new Promise(function(resolve, reject){
        models.Image.destroy({
            where: {id: id},
            transaction: t
        }).then(function(result){
            // delete S3 bucket
            resolve(result);
        }).catch(function(err){
            reject(err);
        });
    });
}

var createImage = function(body, t){
    return new Promise(function(resolve, reject){
        models.Image.create(
            body,
            {transaction: t}
        ).then(image => {
            uploadFile(
                body.path,
                body.originalname,
                body.table,
                body.tableId,
                image.id)
            .then(function(result){
                image.url = result.Location;
                image.save({transaction: t}).then(image => {
                    resolve(image);
                }).catch(err => {
                    reject(err);
                });
            }).catch(function(err){
                reject(err);
            });

        }).catch(err => {
            reject(err);
        });
    });
}

exports.copyImage = function(id, ListingVersionId,t){
    return new Promise(function(resolve, reject){
        models.Image.findOne({
           where: {
               id: id
           },
           transaction: t
        }).then(function(image){
            var body = image.get({plain: true});
            delete body["id"];
            body.ListingVersionId = ListingVersionId;
            body.PreviousVersionId = id;
            for (var propName in body) {
                if (body[propName] === null || body[propName] === undefined) {
                    delete body[propName];
                }
            }
            create(body, t).then(function(image){
                resolve(image);
            }).catch(function(err){
                reject(err);
            });
            return null;
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.createAPI = function(body)
{
    return new Promise(function(resolve, reject){
        listingAPIService.createAssociationAPI(body, "image").then(function(createdImage){
            resolve(createdImage);
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.updateAPI = function(id, body){
    return new Promise(function(resolve, reject){
        listingAPIService.updateAssociationAPI(id, body, "image").then(function(updatedImage){
            resolve(updatedImage);
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.deleteAPI = function(id){
    return new Promise(function(resolve, reject){
        listingAPIService.deleteAssociationAPI(id, "image").then(function(deletedImage){
            resolve(deletedImage);
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.createImage = createImage;
exports.updateImage = updateImage;
exports.find = find;
exports.findWithPrevious = findWithPrevious;
exports.deleteImage = deleteImage;
