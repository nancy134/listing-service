const fs = require('fs');
const AWS = require('aws-sdk');
const models = require("./models")
const listingService = require("./listing");
const listingVersionService = require("./listingVersion");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});


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

var create = function(body){
    return new Promise(function(resolve, reject){
        models.Image.create(body).then(function(image){
            resolve(image);
        }).catch(function(err){
            reject(err);
        });
    }); 
}

var createImage = function(
    ListingId,
    path,
    originalname,
    table,
    tableId
){
    return new Promise(function(resolve, reject){
        models.Image.create({
            ListingVersionId: ListingId 
        }).then(image => {
            uploadFile(
                path,
                originalname,
                table,
                tableId,
                image.id)
            .then(function(result){
                image.url = result.Location;
                image.save().then(image => {
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

exports.copyImage = function(id, ListingVersionId){
    return new Promise(function(resolve, reject){
        models.Image.findOne({
           where: {
               id: id
           }
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
            create(body).then(function(image){
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

exports.createAPI = function(    
    ListingVersionId,
    path,
    originalname,
    table,
    tableId)
{
    return new Promise(function(resolve, reject){
        console.log("ListingVersionId: "+ListingVersionId);
        listingVersionService.find(ListingVersionId).then(function(listingVersion){
            console.log("listingVersion: "+JSON.stringify(listingVersion));
            listingService.find(listingVersion.listing.ListingId).then(function(listing){
                console.log("listing: "+JSON.stringify(listing));
                if (listing.latestDraftId){
                    createImage(listing.latestDraftId,path,originalname,table,tableId).then(function(image){
                        console.log("image: "+JSON.stringify(image));
                        resolve(image);
                    }).catch(function(err){
                        reject(err);
                    });
                } else {
                    listingVersionService.copy(listing.latestApprovedId).then(function(copied){
                         console.log("copied: "+JSON.stringify(copied));
                         createImage(copied.id,path,originalname,table,tableId).then(function(createdImage){
                             console.log("createdImage: "+JSON.stringify(createdImage));
                             var listingBody = {
                                latestDraftId: copied.id
                             };
                             listingService.update(copied.ListingId, listingBody).then(function(updatedListing){
                                 console.log("updatedListing: "+JSON.stringify(updatedListing));
                                 resolve(createdImage);
                             }).catch(function(err){
                                 reject(err);
                             });
                         }).catch(function(err){
                             reject(err);
                         });
                     }).catch(function(err){
                         reject(err);
                     }); 
                }
            }).catch(function(err){
                reject(err);
            });
        }).catch(function(err){
            reject(err);
        });
    });
}

