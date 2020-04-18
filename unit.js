const models = require("./models")
const listingService = require("./listing");
const listingVersionService = require("./listingVersion");

var find = function(id){
    return new Promise(function(resolve, reject){
        models.Unit.findOne({
           where: {
               id: id
           }
        }).then(function(unit){
            resolve(unit);
        }).catch(function(err){
            reject(err);
        });
    });
}

var findWithPrevious = function(id){
    return new Promise(function(resolve, reject){
        models.Unit.findOne({
            where: {
                PreviousVersionId: id
            }
        }).then(function(unit){
            resolve(unit);
        }).catch(function(err){
            reject(err);
        });
    });
}

var create = function(body){
    return new Promise(function(resolve, reject){
        models.Unit.create(body).then(function(unit){
            resolve(unit);
        }).catch(function(err){
            reject(err);
        });
    });
}

var update = function(id, body){
    return new Promise(function(resolve, reject){
        models.Unit.update(
            body,
            {returning: true, where: {id: id}}
        ).then(function([rowsUpdate, [unit]]){
            resolve(unit);
        }).catch(function(err){
            reject(err);
        });
    });
}

var index = function(page, limit, offset, where){
    return new Promise(function(resolve, reject){
        models.Unit.findAndCountAll({
            where: where,
            limit: limit,
            offset: offset,
            attributes: ['id', 'description', 'numUnits', 'space', 'income', 'ListingVersionId','PreviousVersionId']
        }).then(unit => {
            var ret = {
                page: page,
                perPage: limit,
                units: unit 
            };
            resolve(ret);
        }).catch(err => {
            reject(err);
        });
    });
}

exports.getUnits = function(page, limit, offset, where){
    return new Promise(function(resolve, reject){
        index(page, limit, offset, where).then(function(units){
            resolve(units);
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.updateUnit = function(updateData){
    return new Promise(function(resolve, reject){
        update(updateData)
        .then(find)
        .then(function(unit){
            resolve(unit);
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.createUnit = function(body){
    return new Promise(function(resolve, reject){
        create(body).then(function(unit){
            resolve(unit);
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.copyUnit = function(id, ListingVersionId){
    return new Promise(function(resolve, reject){
        models.Unit.findOne({
           where: {
               id: id
           }
        }).then(function(unit){
            var body = unit.get({plain: true});
            delete body["id"];
            body.ListingVersionId = ListingVersionId;
            body.PreviousVersionId = id;
            for (var propName in body) {
                if (body[propName] === null || body[propName] === undefined) {
                    delete body[propName];
                }
            }
            create(body).then(function(unit){
                resolve(unit);
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
            listingService.find(listingVersion.listing.ListingId).then(function(listing){
                if (listing.latestDraftId){
                    create(body).then(function(unit){
                        resolve(unit);
                    }).catch(function(err){
                        reject(err);
                    });
                } else {
                    listingVersionService.copy(listing.latestApprovedId).then(function(copied){
                         body.ListingVersionId = copied.id;
                         create(body).then(function(createdUnit){
                             var listingBody = {
                                latestDraftId: copied.id
                             };
                             listingService.update(copied.ListingId, listingBody).then(function(updatedListing){
                                 resolve(createdUnit);
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
        find(id).then(function(unit){
            listingVersionService.find(unit.ListingVersionId).then(function(listingVersion){
                listingService.find(listingVersion.listing.ListingId).then(function(listing){
                    if (listing.latestDraftId){
                        update(id, body).then(function(unit){
                            resolve(unit);
                        }).catch(function(err){
                            reject(err);
                        });
                    } else {
                        listingVersionService.copy(listing.latestApprovedId).then(function(copied){
                            findWithPrevious(id).then(function(foundUnit){
                                delete body.ListingVersionId;
                                delete body.id;
                                update(foundUnit.id, body).then(function(updatedUnit){
                                    var listingBody = {
                                        latestDraftId: copied.id
                                    };
                                    listingService.update(copied.ListingId, listingBody).then(function(updatedListing){
                                        resolve(updatedUnit);
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
