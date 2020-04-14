const models = require("./models")
const listingService = require("./listing");
const listingVersionService = require("./listingVersion");

var find = function(id){
    return new Promise(function(resolve, reject){
        models.Space.findOne({
           where: {
               id: id
           }
        }).then(function(space){
            resolve(space);
        }).catch(function(err){
            reject(err);
        });
    });
}

var findWithPrevious = function(id){
    return new Promise(function(resolve, reject){
        models.Space.findOne({
            where: {
                PreviousVersionId: id
            }
        }).then(function(space){
            resolve(space);
        }).catch(function(err){
            reject(err);
        });
    });
}

var create = function(body){
    return new Promise(function(resolve, reject){
        models.Space.create(body).then(function(space){
            resolve(space);
        }).catch(function(err){
            reject(err);
        });
    });
}

var update = function(id, body){
    return new Promise(function(resolve, reject){
        models.Space.update(
            body,
            {returning: true, where: {id: id}}
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
    return new Promise(function(resolve, reject){
        update(updateData).then(function(space){
            resolve(space);
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.createSpace = function(body){
    return new Promise(function(resolve, reject){
        create(body).then(function(space){
            resolve(space);
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.copySpace = function(id, ListingVersionId){
    return new Promise(function(resolve, reject){
        models.Space.findOne({
           where: {
               id: id
           }
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
            create(body).then(function(space){
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
        listingVersionService.find(body.ListingVersionId).then(function(listingVersion){
            console.log("createAPI: listingVersion: "+JSON.stringify(listingVersion)); 
            listingService.find(listingVersion.listing.ListingId).then(function(listing){
                console.log("creatAPI: listing: "+JSON.stringify(listing));
                if (listing.latestDraftId){
                    create(body).then(function(space){
                        resolve(space);
                    }).catch(function(err){
                        reject(err);
                    });
                } else {
                    listingVersionService.copy(listing.latestApprovedId).then(function(copied){
                         console.log("createAPI: copied: "+JSON.stringify(copied));
                         body.ListingVersionId = copied.id;
                         create(body).then(function(createdSpace){
                             console.log("createAPI: createdSpace: "+JSON.stringify(createdSpace));
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
                        }).catch(function(err){
                            reject(err);
                        });
                    } else {
                        listingVersionService.copy(listing.latestApprovedId).then(function(copied){
                            findWithPrevious(id).then(function(updateSpace){
                                update(updateSpace.id, body).then(function(updatedSpace){
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
