const models = require("./models")
const listingService = require("./listing");
const listingVersionService = require("./listingVersion");
const listingAPIService = require("./listingAPI");
const jwt = require('./jwt');
const utilities = require('./utilities');

var find = function(id, t){
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

var index = function(authParams, pageParams, where){
    return new Promise(function(resolve, reject){

        var page = pageParams.page;
        var limit = pageParams.limit;
        var offset = pageParams.offset;

        jwt.verifyToken(authParams).then(function(jwtResult){ 
            models.Tenant.findAndCountAll({
                where: where,
                limit: limit,
                offset: offset,
                attributes: [
                    'id',
                    'tenant',
                    'space',
                    'baseRent',
                    'leaseEnds',
                    'ListingVersionId',
                    'PreviousVersionid'
                ]
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
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.getTenants = function(authParams,pageParams, where){
    var page = pageParams.page;
    var limit = pageParams.limit;
    var offset = pageParams.offset;
    return new Promise(function(resolve, reject){
        jwt.verifyToken(authParams).then(function(jwtResult){
            index(page, limit, offset, where).then(function(tenants){
                resolve(tenants);
            }).catch(function(err){
                reject(err);
            });
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

var deleteTenant = function(id, t){
    return new Promise(function(resolve, reject){
        models.Tenant.destroy({
            where: {id: id},
            transaction: t
        }).then(function(result){
            resolve(result);
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.createAPI = function(authParams, listingVersionId, body){
    return new Promise(function(resolve, reject){
        jwt.verifyToken(authParams).then(function(jwtResult){
            // Check to see if editor of listing
            listingAPIService.createAssociationAPI(body, "tenant").then(function(createdTenant){
                resolve(createdTenant);
            }).catch(function(err){
                reject(err);
            });
        }).catch(function(err){
            reject(err);
        });
    });
}
exports.updateAPI = function(authParams, listingVersionId, tenantId, body){
    return new Promise(function(resolve,reject){
        jwt.verifyToken(authParams).then(function(jwtResult){
            // Check they are editor of the listing

            listingAPIService.updateAssociationAPI(tenantId, body, "tenant").then(function(updatedTenant){
                resolve(updatedTenant);
            }).catch(function(err){
                reject(err);
            });
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.deleteAPI = function(authParams, tenantId){
    return new Promise(function(resolve, reject){
        jwt.verifyToken(authParams).then(function(jwtResult){
            listingAPIService.deleteAssociationAPI(tenantId, "tenant").then(function(deletedTenant){
                resolve(deleteTenant);
            }).catch(function(err){
                reject(err);
            });
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.find = find;
exports.update = update;
exports.findWithPrevious = findWithPrevious;
exports.deleteTenant = deleteTenant;
