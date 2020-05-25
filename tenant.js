const models = require("./models")
const listingService = require("./listing");
const listingVersionService = require("./listingVersion");
const listingAPIService = require("./listingAPI");

var find = function(id, t){
    console.log("id: "+id);
    return new Promise(function(resolve, reject){
        models.Tenant.findOne({
           where: {
               id: id
           },
           transaction: t
        }).then(function(tenant){
            resolve(tenant);
        }).catch(function(err){
            reject(err);
        });
    });
}
var findWithPrevious = function(id, t){
    return new Promise(function(resolve, reject){
        models.Tenant.findOne({
            where: {
                PreviousVersionId: id
            },
            transaction: t
        }).then(function(tenant){
            resolve(tenant);
        }).catch(function(err){
            reject(err);
        });
    });
}

var create = function(body, t){
    return new Promise(function(resolve, reject){
        models.Tenant.create(body, {transaction: t}).then(function(tenant){
            resolve(tenant);
        }).catch(function(err){
            reject(err);
        });
    });
}

var update = function(id, body, t){
    // Clear numerics
    if (body.space === ""){
        body.space = null;
    }
    if (body.baseRent === ""){
        body.baseRent = null;
    }
    if (body.leaseEnds === ""){
        body.leaseEnds = null;
    }
    return new Promise(function(resolve, reject){
        models.Tenant.update(
            body,
            {
                returning: true, 
                where: {id: id},
                transaction: t
            }
        ).then(function([rowsUpdate, [tenant]]){
            resolve(tenant);
        }).catch(function(err){
            reject(err);
        });
    });
}

var index = function(page, limit, offset, where){
    return new Promise(function(resolve, reject){
        models.Tenant.findAndCountAll({
            where: where,
            limit: limit,
            offset: offset,
            attributes: ['id', 'tenant', 'space', 'baseRent', 'leaseEnds', 'ListingVersionId', 'PreviousVersionid']
        }).then(tenant => {
            var ret = {
                page: page,
                perPage: limit,
                tenants: tenant 
            };
            resolve(ret);
        }).catch(err => {
            reject(err);
        });
    });
}

exports.getTenants = function(page, limit, offset, where){
    return new Promise(function(resolve, reject){
        index(page, limit, offset, where).then(function(tenants){
            resolve(tenants);
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.updateTenant = function(updateData){
    return new Promise(function(resolve, reject){
        update(updateData)
        .then(find)
        .then(function(tenant){
            resolve(tenant);
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.createTenant = function(body, t){
    return new Promise(function(resolve, reject){
        create(body, t).then(function(tenant){
            resolve(tenant);
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.copyTenant = function(id, ListingVersionId, t){
    return new Promise(function(resolve, reject){
        models.Tenant.findOne({
           where: {
               id: id
           },
           transaction: t
        }).then(function(tenant){
            var body = tenant.get({plain: true});
            delete body["id"];
            body.ListingVersionId = ListingVersionId;
            body.PreviousVersionId = id;
            for (var propName in body) {
                if (body[propName] === null || body[propName] === undefined) {
                    delete body[propName];
                }
            }
            create(body, t).then(function(tenant){
                resolve(tenant);
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
        listingAPIService.createAssociationAPI(body, "tenant").then(function(createdTenant){
            resolve(createdTenant);
        }).catch(function(err){
            reject(err);
        });
    });
}
exports.updateAPI = function(id, body){
    return new Promise(function(resolve,reject){
        listingAPIService.updateAssociationAPI(id, body, "tenant").then(function(updatedTenant){
            resolve(updatedTenant);
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
                    create(body).then(function(tenant){
                        resolve(tenant);
                    }).catch(function(err){
                        reject(err);
                    });
                } else {
                    listingVersionService.copy(listing.latestApprovedId).then(function(copied){
                         body.ListingVersionId = copied.id;
                         create(body).then(function(createdTenant){
                             var listingBody = {
                                latestDraftId: copied.id
                             };
                             listingService.update(copied.ListingId, listingBody).then(function(updatedListing){
                                 resolve(createdTenant);
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
        find(id).then(function(tenant){
            listingVersionService.find(tenant.ListingVersionId).then(function(listingVersion){
                listingService.find(listingVersion.listing.ListingId).then(function(listing){
                    if (listing.latestDraftId){
                        update(id, body).then(function(tenant){
                            resolve(tenant);
                        }).catch(function(err){
                            reject(err);
                        });
                    } else {
                        listingVersionService.copy(listing.latestApprovedId).then(function(copied){
                            findWithPrevious(id).then(function(foundTenant){
                                delete body.ListingVersionId;
                                delete body.id;
                                update(foundTenant.id, body).then(function(updatedTenant){
                                    var listingBody = {
                                        latestDraftId: copied.id
                                    };
                                    listingService.update(copied.ListingId, listingBody).then(function(updatedListing){
                                        resolve(updatedTenant);
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
