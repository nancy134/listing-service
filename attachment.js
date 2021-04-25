const fs = require('fs');
const AWS = require('aws-sdk');
const models = require("./models")
const listingService = require("./listing");
const listingVersionService = require("./listingVersion");
const listingAPIService = require("./listingAPI");
const sharp = require('sharp');
const FileType = require('file-type');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

var index = function(page, limit, offset, where){
    return new Promise(function(resolve, reject){
        models.Attachment.findAndCountAll({
            where: where,
            limit: limit,
            offset: offset,
            attributes: ['id', 'order', 'url']
        }).then(attachments => {
            var ret = {
                page: page,
                perPage: limit,
                attachments: attachments 
            }
            resolve(ret);
        }).catch(err => {
            reject(err);
        });
    });
}


exports.getAttachments = function(page, limit, offset, where){
    return new Promise(function(resolve, reject){
        index(page, limit, offset, where).then(function(attachments){
            resolve(attachments);
        }).catch(function(err){
            reject(err);
        });
    });
}

var uploadFile = function(path,fileName,table,tableIndex,attachmentIndex, name){
    return new Promise(function(resolve, reject){
        var filePath = "./"+path;
        FileType.fromFile(filePath).then(function(fileType){
            var ext = null;
            if (fileType) ext = fileType.ext;
            fs.readFile(filePath, (err, originalAttachment) => {
                if (err){
                    reject(err);
                }

                fileName = name.replace(/\s/g, '');
                var key = 
                    table + "/" +
                    tableIndex + "/" +
                    'attachment' + "/" +
                    attachmentIndex + "/" +
                    fileName+tableIndex;
                if (ext) key += "."+ext;

                var params = {
                    Bucket: process.env.S3_BUCKET,
                    Key: key,
                    Body: originalAttachment
                };
                s3.upload(params, function(s3Err, s3Data) {
                    // Remove file
                    fs.unlink(filePath, (err) => {
                        if (err) {
                            console.log(err)
                        }
                    });
                    if (s3Err) {
                        reject(s3Err);
                    } else {
                        s3Data.name = name;
                        s3Data.fileType = ext;
                        resolve(s3Data);
                    }
                });
            });
        });
    });
}

var find = function(id, t){
    return new Promise(function(resolve, reject){
        models.Attachment.findOne({
            where: {
                id: id
            },
            transaction: t
        }).then(function(attachment){
            resolve(attachment);
        }).catch(function(err){
            reject(err);
        });
    });
}

var findWithPrevious = function(id, t){
    return new Promise(function(resolve, reject){
        models.Attachment.findOne({
            where: {
                PreviousVersionId: id
            },
            transaction: t
        }).then(function(attachment){
            resolve(attachment);
        }).catch(function(err){
            reject(err);
        });
    });
}

var create = function(body, t){
    return new Promise(function(resolve, reject){
        models.Attachment.create(body, {transaction: t}).then(function(attachment){
            resolve(attachment);
        }).catch(function(err){
            reject(err);
        });
    }); 
}
var updateAttachment = function(id, body, t){
    return new Promise(function(resolve, reject){
        models.Attachment.update(
            body,
            {
                returning: true,
                where: {id: id},
                transaction: t
            }
        ).then(function([rowsUpdate, [attachment]]){
            resolve(attachment);
        }).catch(function(err){
            reject(err);
        });
    });
}

var deleteAttachment = function(id, t){
    return new Promise(function(resolve, reject){
        models.Attachment.destroy({
            where: {id: id},
            individualHooks: true,
            transaction: t
        }).then(function(result){
            resolve(result);
        }).catch(function(err){
            reject(err);
        });
    });
}

var createAttachment = function(body, t){
    return new Promise(function(resolve, reject){
        models.Attachment.create(
            body,
            {transaction: t}
        ).then(attachment => {
            uploadFile(
                body.path,
                body.originalname,
                body.table,
                body.tableId,
                attachment.id,
                body.name)
            .then(function(result){
                attachment.url = result.Location;
                attachment.fileType = result.fileType;
                attachment.name = result.name;
                attachment.save({transaction: t}).then(attachment => {
                    resolve(attachment);
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

exports.copyAttachment = function(id, ListingVersionId,t){
    return new Promise(function(resolve, reject){
        models.Attachment.findOne({
           where: {
               id: id
           },
           transaction: t
        }).then(function(attachment){
            var body = attachment.get({plain: true});
            delete body["id"];
            body.ListingVersionId = ListingVersionId;
            body.PreviousVersionId = id;
            for (var propName in body) {
                if (body[propName] === null || body[propName] === undefined) {
                    delete body[propName];
                }
            }
            create(body, t).then(function(attachment){
                resolve(attachment);
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
        listingAPIService.createAssociationAPI(body, "attachment").then(function(createdAttachment){
            resolve(createdAttachment);
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.updateAPI = function(id, body){
    return new Promise(function(resolve, reject){
        listingAPIService.updateAssociationAPI(id, body, "attachment").then(function(updatedAttachment){
            resolve(updatedAttachment);
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.deleteAPI = function(id){
    return new Promise(function(resolve, reject){
        listingAPIService.deleteAssociationAPI(id, "attachment").then(function(deletedAttachment){
            resolve(deletedAttachment);
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.createAttachment = createAttachment;
exports.updateAttachment = updateAttachment;
exports.find = find;
exports.findWithPrevious = findWithPrevious;
exports.deleteAttachment = deleteAttachment;
