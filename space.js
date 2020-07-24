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

var updateSpace = function(id, body, t){

    if (body.price === "") body.price = null;
    if (body.driveIndoors === "") body.driveInDoors = null;
    if (body.floors === "") body.floors = null;
    if (body.loadingDocks === "") body.loadingDocks = null;
    if (body.ceilingHeight === "") body.ceilingHeight = null;
    if (body.nets === "") body.nets = null;
    if (body.availableDate === "") body.availableDate = null;

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

exports.deleteSpace = function(id, t){
    return new Promise(function(resolve, reject){
        models.Space.destroy({
            where: {id: id},
            transaction: t
        }).then(function(result){
            resolve(result);
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

exports.deleteAPI = function(id){
    return new Promise(function(resolve,reject){
        listingAPIService.deleteAssociationAPI(id, "space").then(function(deletedSpace){
            resolve(deletedSpace);
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.find = find;
exports.updateSpace = updateSpace;
exports.findWithPrevious = findWithPrevious;
