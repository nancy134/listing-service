const models = require("./models");
const spaceService = require("./space");
const unitService = require("./unit");
const tenantService = require("./tenant");
const portfolioService = require("./portfolio");

exports.index = function(page, limit, offset, where){
    return new Promise(function(resolve, reject){
        models.ListingVersion.findAndCountAll({
            where: where,
            distinct: true,
            limit: limit,
            offset: offset,
            attributes: ['id','listingType', 'listingPrice', 'address', 'city','state','yearBuilt', 'owner', 'publishStatus', 'ListingId'],
            include: [
            {
                model: models.Image, 
                as: 'images',
                attributes: ['id','url']
            },
            {
                model: models.Space,
                as: 'spaces',
                attributes: ['price', 'size']
            }
            ]
        }).then(listings => {
            var ret = {
                page: page,
                perPage: limit,
                listings: listings
            };
            resolve(ret); 
        }).catch(err => { 
            reject(err);
        });
    });
}

exports.indexAdmin = function(page, limit, offset, where){
    return new Promise(function(resolve, reject){
        models.ListingVersion.findAll({
            attributes: ['id','publishStatus'],
        }).then(listings => {
            resolve(listings); 
        }).catch(err => { 
            reject(err);
        });
    });
}
find = function(id){
    return new Promise(function(resolve, reject){
        models.ListingVersion.findOne({
            where: {
                id: id 
            },
            include: [
            {
                model: models.Image,
                as: 'images',
                attributes: ['id','url']
            },
            {
                model: models.Space,
                as: 'spaces',
                attributes: ['id', 'unit','price', 'size','type','use']
            },
            {
                model: models.Unit,
                as: 'units',
                attribute: ['id', 'description', 'numUnits', 'space', 'income']
            },
            {
                model: models.Tenant,
                as: 'tenants',
                attributes: ['id', 'tenant', 'space', 'leaseEnds']
            },
            {
                model: models.Portfolio,
                as: 'portfolios',
                attributes: ['id', 'tenant', 'buildingSize', 'lotSize', 'type']
            }
            ]
        }).then(function(listing){
            ret = {
                listing: listing,
                states: models.ListingVersion.rawAttributes.state.values,
                listingTypes: models.ListingVersion.rawAttributes.listingType.values,
                propertyTypes: models.ListingVersion.rawAttributes.propertyType.values,
                spaceTypes: models.Space.rawAttributes.type.values,
                spaceUse: models.Space.rawAttributes.use.values,
                amenities: models.ListingVersion.rawAttributes.amenities.type.options.type.values
            };
            resolve(ret);
        }).catch(function(err){
            console.log("findListingVersion err: "+err);
            reject(err);
        });
    });
}

create = function(body){
    body.publishStatus = "Draft";
    return new Promise(function(resolve, reject){
        models.ListingVersion.create(body).then(function(listing){
            resolve(listing);
        }).catch(function(err){
            console.log("createListingVersion err: "+err);
            reject(err);
        });
    });
}

exports.update = function(id, body){
    return new Promise(function(resolve, reject){
        models.ListingVersion.update(
            body,
            {returning: true, where: {id: id}}
        ).then(function([rowsUpdate, [listing]]){
            resolve(listing);
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.indexAdmin = function(page, limit, offset, where){
    return new Promise(function(resolve, reject){
        models.ListingVersion.findAll({
            attributes: ['id','publishStatus'],
        }).then(listings => {
            resolve(listings); 
        }).catch(err => { 
            reject(err);
        });
    });
}

exports.copy = function(id){
    return new Promise(function(resolve, reject){
        this.find(id).then(function(listingVersion){
            var body = listingVersion.listing.get({plain: true});
            delete body.id;
            delete body.updatedAt;
            delete body.createdAt;

            delete body["images"];

            var spaces = body.spaces
            delete body.spaces;
            var units = body.units;
            delete body.units;
            var tenants = body.tenants;
            delete body.tenants;
            var portfolios = body.portfolios;
            delete body.portfolios;

            for (var propName in body) { 
                if (body[propName] === null || body[propName] === undefined) {
                    delete body[propName];
                }
            }
            create(body).then(function(newListingVersion){
                var promises = [];
                for (var index in spaces){
                    var copyPromise = spaceService.copySpace(
                        spaces[index].id, 
                        newListingVersion.id);
                    promises.push(copyPromise);
                }
                for (var index in units){
                    var copyPromise = unitService.copyUnit(
                        units[index].id,
                        newListingVersion.id);
                    promises.push(copyPromise);
                }
                for (var index in tenants){
                    var copyPromise = tenantService.copyTenant(
                        tenants[index].id,
                        newListingVersion.id);
                    promises.push(copyPromise);
                }
                for (var index in portfolios){
                    var copyPromise = portfolioService.copyPortfolio(
                        portfolios[index].id,
                        newListingVersion.id);
                    promises.push(copyPromise);
                }

                Promise.all(promises).then(function(values){
                    resolve(values);
                }).catch(function(err){
                     reject(err);
                });

                resolve(newListingVersion);
            }).catch(function(err){
                reject(err);
            });
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.find = find;
exports.create = create;
