const models = require("./models")
const listingService = require("./listing");
const listingVersionService = require("./listingVersion");
const listingAPIService = require("./listingAPI");

var find = function(id, t){
    return new Promise(function(resolve, reject){
        models.Unit.findOne({
           where: {
               id: id
           },
           transaction: t
        }).then(function(unit){
            resolve(unit);
        }).catch(function(err){
            reject(err);
        });
    });
}

var findWithPrevious = function(id,t){
    return new Promise(function(resolve, reject){
        models.Unit.findOne({
            where: {
                PreviousVersionId: id
            },
            transaction: t
        }).then(function(unit){
            resolve(unit);
        }).catch(function(err){
            reject(err);
        });
    });
}

var create = function(body,t){
    return new Promise(function(resolve, reject){
        models.Unit.create(body, {transaction: t}).then(function(unit){
            resolve(unit);
        }).catch(function(err){
            reject(err);
        });
    });
}

var update = function(id, body, t){
    // Clear numerics
    if (body.numUnits === ""){
        body.numUnits = null;
    }
    if (body.space === ""){
        body.space = null;
    }
    if (body.income === ""){
        body.income = null;
    }
    return new Promise(function(resolve, reject){
        models.Unit.update(
            body,
            {
                returning: true, 
                where: {id: id},
                transaction: t
            }
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

exports.createUnit = function(body, t){
    return new Promise(function(resolve, reject){
        create(body, t).then(function(unit){
            resolve(unit);
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.copyUnit = function(id, ListingVersionId, t){
    return new Promise(function(resolve, reject){
        models.Unit.findOne({
           where: {
               id: id
           },
           transaction: t
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
            create(body, t).then(function(unit){
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
        listingAPIService.createAssociationAPI(body, "unit").then(function(createdUnit){
            resolve(createdUnit);
        }).catch(function(err){
            reject(err);
        });
    });
}
exports.updateAPI = function(id, body){
    return new Promise(function(resolve,reject){
        listingAPIService.updateAssociationAPI(id, body, "unit").then(function(updatedUnit){
            resolve(updatedUnit);
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.find = find;
exports.update = update;
exports.findWithPrevious = findWithPrevious;
