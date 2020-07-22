const models = require("./models")
const listingService = require("./listing");
const listingVersionService = require("./listingVersion");
const listingAPIService = require("./listingAPI");

var find = function(id, t){
    return new Promise(function(resolve, reject){
        models.Portfolio.findOne({
           where: {
               id: id
           },
           transaction: t
        }).then(function(portfolio){
            resolve(portfolio);
        }).catch(function(err){
            reject(err);
        });
    });
}

var findWithPrevious = function(id, t){
    return new Promise(function(resolve, reject){
        models.Portfolio.findOne({
            where: {
                PreviousVersionId: id
            },
            transaction: t
        }).then(function(portfolio){
            resolve(portfolio);
        }).catch(function(err){
            reject(err);
        });
    });
}

var create = function(body, t){
    return new Promise(function(resolve, reject){
        models.Portfolio.create(body, {transaction: t}).then(function(portfolio){
            resolve(portfolio);
        }).catch(function(err){
            reject(err);
        });
    });
}

var update = function(id, body, t){
    // Clear numerics
    if (body.lotSize === ""){
        body.lotSize = null;
    }
    if (body.buildingSize === ""){
        body.buildingSize = null;
    }
    return new Promise(function(resolve, reject){
        models.Portfolio.update(
            body,
            {
                returning: true, 
                where: {id: id},
                transaction: t
            }
        ).then(function([rowsUpdate, [portfolio]]){
            resolve(portfolio);
        }).catch(function(err){
            reject(err);
        });
    });
}

var index = function(page, limit, offset, where){
    return new Promise(function(resolve, reject){
        models.Portfolio.findAndCountAll({
            where: where,
            limit: limit,
            offset: offset,
            attributes: ['id', 'tenant', 'buildingSize', 'type', 'ListingVersionId','PreviousVersionId']
        }).then(portfolios => {
            var ret = {
                page: page,
                perPage: limit,
                portfolios: portfolios 
            };
            resolve(ret);
        }).catch(err => {
            reject(err);
        });
    });
}

exports.getPortfolios = function(page, limit, offset, where){
    return new Promise(function(resolve, reject){
        index(page, limit, offset, where).then(function(portfolios){
            resolve(portfolios);
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.updatePortfolio = function(updateData){
    return new Promise(function(resolve, reject){
        update(updateData)
        .then(find)
        .then(function(portfolio){
            resolve(portfolio);
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.createPortfolio = function(body, t){
    return new Promise(function(resolve, reject){
        create(body, t).then(function(portfolio){
            resolve(portfolio);
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.copyPortfolio = function(id, ListingVersionId, t){
    return new Promise(function(resolve, reject){
        models.Portfolio.findOne({
           where: {
               id: id
           },
           transaction: t
        }).then(function(portfolio){
            var body = portfolio.get({plain: true});
            delete body["id"];
            body.ListingVersionId = ListingVersionId;
            body.PreviousVersionId = id;
            for (var propName in body) {
                if (body[propName] === null || body[propName] === undefined) {
                    delete body[propName];
                }
            }
            create(body, t).then(function(portfolio){
                resolve(portfolio);
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
        listingAPIService.createAssociationAPI(body, "portfolio").then(function(createdPortfolio){
            resolve(createdPortfolio);
        }).catch(function(err){
            reject(err);
        });
    });
}
exports.updateAPI = function(id, body){
    return new Promise(function(resolve,reject){
        listingAPIService.updateAssociationAPI(id, body, "portfolio").then(function(updatedPortfolio){
            resolve(updatedPortfolio);
        }).catch(function(err){
            reject(err);
        });
    });
}
exports.find = find;
exports.update = update;
exports.findWithPrevious = findWithPrevious;
