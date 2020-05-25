const models = require("./models")
const listingService = require("./listing");
const listingVersionService = require("./listingVersion");
const listingAPIService = require("./listingAPI");

var find = function(id, t){
    return new Promise(function(resolve, reject){
        models.Space.findOne({
           where: {
               id: id
           },
           transaction: t
        }).then(function(space){
            resolve(space);
        }).catch(function(err){
            reject(err);
        });
    });
}

var findWithPrevious = function(id, t){
    return new Promise(function(resolve, reject){
        models.Space.findOne({
            where: {
                PreviousVersionId: id
            },
            transaction: t
        }).then(function(space){
            resolve(space);
        }).catch(function(err){
            reject(err);
        });
    });
}

var create = function(body, t){
    return new Promise(function(resolve, reject){
        models.Space.create(body, {transaction: t}).then(function(space){
            resolve(space);
        }).catch(function(err){
            reject(err);
        });
    });
}

var update = function(id, body, t){
    return new Promise(function(resolve, reject){
        models.Space.update(
            body,
            {
                returning: true, 
                where: {id: id},
                transaction: t
            }
        ).then(function([rowsUpdate, [space]]){
            resolve(space);
        }).catch(function(err){
            reject(err);
        });
    });
}

var index = function(page, limit, offset, where){
    return new Promise(function(resolve, reject){
        models.Space.findAndCountAll({
            where: where,
            limit: limit,
            offset: offset,
            attributes: ['id', 'unit', 'size', 'type', 'use', 'ListingVersionId', 'PreviousVersionId']
        }).then(spaces => {
            var ret = {
                page: page,
                perPage: limit,
                spaces: spaces
            };
            resolve(ret);
        }).catch(err => {
            reject(err);
        });
    });
}

exports.getSpaces = function(page, limit, offset, where){
    return new Promise(function(resolve, reject){
        index(page, limit, offset, where).then(function(spaces){
            resolve(spaces);
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.updateSpace = function(updateData){

    if (body.price === "") body.price = null;
    if (body.driveIndoors === "") body.driveInDoors = null;
    if (body.floors === "") body.floors = null;
    if (body.loadingDocks === "") body.loadingDocks = null;
    if (body.ceilingHeight === "") body.ceilingHeight = null;
    if (body.nets === "") body.nets = null;
    if (body.availableDate === "") body.availableDate = null;

    return new Promise(function(resolve, reject){
        update(updateData).then(function(space){
            resolve(space);
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.createSpace = function(body, t){
    return new Promise(function(resolve, reject){
        create(body, t).then(function(space){
            resolve(space);
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.copySpace = function(id, ListingVersionId, t){
    return new Promise(function(resolve, reject){
        models.Space.findOne({
           where: {
               id: id
           },
           transaction: t
        }).then(function(space){
            var body = space.get({plain: true});
            delete body["id"];
            body.ListingVersionId = ListingVersionId;
            body.PreviousVersionId = id;
            for (var propName in body) {
                if (body[propName] === null || body[propName] === undefined) {
                    delete body[propName];
                }
            }
            create(body, t).then(function(space){
                resolve(space);
            }).catch(function(err){
                reject(err);
            });
            return null;
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.createAPI = function(body){
    return new Promise(function(resolve, reject){
        listingAPIService.createAssociationAPI(body, "space").then(function(createdSpace){
            resolve(createdSpace);
        }).catch(function(err){
            reject(err);
        });
    });
}
exports.updateAPI = function(id, body){
    return new Promise(function(resolve,reject){
        listingAPIService.updateAssociationAPI(id, body, "space").then(function(updatedSpace){
            resolve(updatedSpace);
        }).catch(function(err){
            reject(err);
        });
    });
}

/*
exports.createAPI = function(body){
    return new Promise(function(resolve, reject){
        listingVersionService.find(body.ListingVersionId).then(function(listingVersion){
            listingService.find(listingVersion.listing.ListingId).then(function(listing){
                if (listing.latestDraftId){
                    create(body).then(function(space){
                        resolve(space);
                    }).catch(function(err){
                        reject(err);
                    });
                } else {
                    listingVersionService.copy(listing.latestApprovedId).then(function(copied){
                         body.ListingVersionId = copied.id;
                         create(body).then(function(createdSpace){
                             var listingBody = {
                                latestDraftId: copied.id
                             };
                             listingService.update(copied.ListingId, listingBody).then(function(updatedListing){
                                 resolve(createdSpace);
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

exports.updateAPI = function(id, body){
    return new Promise(function(resolve, reject){
        find(id).then(function(space){
            listingVersionService.find(space.ListingVersionId).then(function(listingVersion){
                listingService.find(listingVersion.listing.ListingId).then(function(listing){
                    if (listing.latestDraftId){
                        update(id, body).then(function(space){
                            resolve(space);
                        }).catch(function(err){
                            reject(err);
                        });
                    } else {
                        listingVersionService.copy(listing.latestApprovedId).then(function(copied){
                            findWithPrevious(id).then(function(foundSpace){
                                delete body.ListingVersionId;
                                delete body.id;
                                update(foundSpace.id, body).then(function(updatedSpace){
                                    var listingBody = {
                                        latestDraftId: copied.id
                                    };
                                    listingService.update(copied.ListingId, listingBody).then(function(updatedListing){
                                        resolve(updatedSpace);
                                    }).catch(function(err){
                                        reject(err);
                                    });
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
        }).catch(function(err){
            reject(err);
        });
    });
}
*/

exports.find = find;
exports.update = update;
exports.findWithPrevious = findWithPrevious;
