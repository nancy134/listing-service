const models = require("./models")
const listingService = require("./listing");
const listingVersionService = require("./listingVersion");
const listingAPIService = require("./listingAPI");
const jwt = require('./jwt');
const utilities = require('./utilities');

var find = function(id, t){
    return new Promise(function(resolve, reject){
        models.Condo.findOne({
            where: {
                id: id 
            },
            transaction: t
        }).then(function(condo){
            resolve(condo);
        }).catch(function(err){
            reject(err);
        });
    });
}
var findWithPrevious = function(id, t){
    return new Promise(function(resolve, reject){
        models.Condo.findOne({
            where: {
                PreviousVersionId: id
            },
            transaction: t
        }).then(function(condo){
            resolve(condo);
        }).catch(function(err){
            reject(err);
        });
    });
}

var create = function(body, t){
    return new Promise(function(resolve, reject){
        models.Condo.create(body, {transaction: t}).then(function(condo){
            resolve(condo);
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
        models.Condo.update(
            body,
            {
                returning: true, 
                where: {id: id},
                transaction: t
            }
        ).then(function([rowsUpdate, [condo]]){
            resolve(condo);
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
            models.Condo.findAndCountAll({
                where: where,
                limit: limit,
                offset: offset,
                attributes: [
                    'unit',
                    'size',
                    'fees',
                    'taxes',
                    'id',
                    'ListingVersionId',
                    'PreviousVersionid'
                ]
            }).then(condo => {
                var ret = {
                    page: page,
                    perPage: limit,
                    condos: condo 
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

exports.getCondos = function(authParams,pageParams, where){
    var page = pageParams.page;
    var limit = pageParams.limit;
    var offset = pageParams.offset;
    return new Promise(function(resolve, reject){
        jwt.verifyToken(authParams).then(function(jwtResult){
            index(page, limit, offset, where).then(function(condos){
                resolve(condos);
            }).catch(function(err){
                reject(err);
            });
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.updateCondo = function(updateData){
    return new Promise(function(resolve, reject){
        update(updateData)
        .then(find)
        .then(function(condo){
            resolve(condo);
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.createCondo = function(body, t){
    return new Promise(function(resolve, reject){
        create(body, t).then(function(condo){
            resolve(condo);
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.copyCondo = function(id, ListingVersionId, t){
    return new Promise(function(resolve, reject){
        models.Condo.findOne({
           where: {
               id: id
           },
           transaction: t
        }).then(function(condo){
            var body = condo.get({plain: true});
            delete body["id"];
            body.ListingVersionId = ListingVersionId;
            body.PreviousVersionId = id;
            for (var propName in body) {
                if (body[propName] === null || body[propName] === undefined) {
                    delete body[propName];
                }
            }
            create(body, t).then(function(condo){
                resolve(condo);
            }).catch(function(err){
                reject(err);
            });
            return null;
        }).catch(function(err){
            reject(err);
        });
    });
}

var deleteCondo = function(id, t){
    return new Promise(function(resolve, reject){
        models.Condo.destroy({
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
            listingAPIService.createAssociationAPI(body, "condo").then(function(createdCondo){
                resolve(createdCondo);
            }).catch(function(err){
                reject(err);
            });
        }).catch(function(err){
            reject(err);
        });
    });
}
exports.updateAPI = function(authParams, listingVersionId, condoId, body){
    return new Promise(function(resolve,reject){
        jwt.verifyToken(authParams).then(function(jwtResult){
            // Check they are editor of the listing

            listingAPIService.updateAssociationAPI(condoId, body, "condo").then(function(updatedCondo){
                resolve(updatedCondo);
            }).catch(function(err){
                reject(err);
            });
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.deleteAPI = function(authParams, condoId){
    return new Promise(function(resolve, reject){
        jwt.verifyToken(authParams).then(function(jwtResult){
            listingAPIService.deleteAssociationAPI(condoId, "condo").then(function(deletedCondo){
                resolve(deleteCondo);
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
exports.deleteCondo = deleteCondo;
