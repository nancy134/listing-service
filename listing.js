const models = require("./models");
const spaceService = require("./space");
const unitService = require("./unit");
const tenantService = require("./tenant");
const portfolioService = require("./portfolio");

var findListingVersion = function(listingStruct){
    return new Promise(function(resolve, reject){
        models.ListingVersion.findOne({
            where: {
                id: listingStruct.listingVersionResult.id 
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
var updateListingVersion = function(listingStruct){
    return new Promise(function(resolve, reject){
        models.ListingVersion.update(
            listingStruct.listingVersionBody,
            {returning: true, where: {id: listingStruct.listingVersionResult.id}}
        ).then(function([rowsUpdate, [listing]]){
            resolve(listing);
        }).catch(function(err){
            reject(err);
        });
    });
}

var updateListing = function(listingStruct){
    return new Promise(function(resolve, reject){
        models.Listing.update(
            listingStruct.listingBody,
            {returning: true, where: {id: listingStruct.listingResult.id}}
        ).then(function([rowsUpdate, [listing]]){
            listingStruct.listingBody = listing;
            resolve(listingStruct);
        }).catch(function(err){
            console.log("updateListing err: "+err);
            reject(err);
        });
    });
}

var createListingVersion = function(listingStruct){
    listingStruct.listingVersionBody.publishStatus = "Draft";
    return new Promise(function(resolve, reject){
        models.ListingVersion.create(listingStruct.listingVersionBody).then(function(listing){
            listingStruct.listingVersionResult = listing;
            listingStruct.listingBody.latestDraftId = listing.id;
            resolve(listingStruct);
        }).catch(function(err){
            console.log("createListingVersion err: "+err);
            reject(err);
        });
    });
}

var createListing = function(listingStruct){
    return new Promise(function(resolve, reject){
        models.Listing.create(listingStruct.listingBody).then(function(listing){
            listingStruct.listingResult = listing;
            listingStruct.listingVersionBody.ListingId = listing.id;
            resolve(listingStruct);
        }).catch(function(err){
            console.log("createListing: err: "+err);
            reject(err);
        });
    });
}

var copyListingVersion = function(id){
    return new Promise(function(resolve, reject){
        var listingStruct = {
            listingVersionResult: {id: id}
        };
        findListingVersion(listingStruct).then(function(listingVersion){
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
            listingStruct.listingVersionBody = body;
            listingStruct.listingBody = {};
            createListingVersion(listingStruct).then(function(newListingStruct){
                var promises = [];
                for (var index in spaces){
                    var copyPromise = spaceService.copySpace(
                        spaces[index].id, 
                        newListingStruct.listingVersionResult.id);
                    promises.push(copyPromise);
                }
                for (var index in units){
                    var copyPromise = unitService.copyUnit(
                        units[index].id,
                        newListingStruct.listingVersionResult.id);
                    promises.push(copyPromise);
                }
                for (var index in tenants){
                    var copyPromise = tenantService.copyTenant(
                        tenants[index].id,
                        newListingStruct.listingVersionResult.id);
                    promises.push(copyPromise);
                }
                for (var index in portfolios){
                    var copyPromise = portfolioService.copyPortfolio(
                        portfolios[index].id,
                        newListingStruct.listingVersionResult.id);
                    promises.push(copyPromise);
                }

                Promise.all(promises).then(function(values){
                    resolve(values);
                }).catch(function(err){
                     reject(err);
                });

                resolve(newListingStruct);
            }).catch(function(err){
                reject(err);
            });
        }).catch(function(err){
            reject(err);
        });
    });
}
var indexListingVersion = function(page, limit, offset, where){
    return new Promise(function(resolve, reject){
        models.ListingVersion.findAndCountAll({
            where: where,
            distinct: true,
            limit: limit,
            offset: offset,
            attributes: ['id','listingType', 'listingPrice', 'address', 'city','state','yearBuilt', 'owner'],
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
exports.getListingsAPI = function(page, limit, offset, where){
    return new Promise(function(resolve, reject){
        indexListingVersion(page, limit, offset, where).then(function(listings){
            resolve(listings);
        }).catch(function(err){
            reject(err);
        }); 
    });    
}
exports.getListingAPI = function(id){
    var listingStruct = {
        listingVersionResult: {id: id}
    };
    return new Promise(function(resolve, reject){
        findListingVersion(listingStruct).then(function(listing){
            resolve(listing);
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.createListingAPI = function(listingStruct){
    listingStruct.listingBody = {};
    return new Promise(function(resolve, reject){
        createListing(listingStruct)
        .then(createListingVersion)
        .then(updateListing) 
        .then(findListingVersion)
        .then(function(listing){
            resolve(listing);
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.publishListingAPI = function(listingStruct){
    return new Promise(function(resolve, reject){
        updateListingVersion(listingStruct)
        .then(function(listingVersion){
            resolve(listingVersion);
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.approveListingAPI = function(listingStruct){
    return new Promise(function(resolve, reject){
        updateListingVersion(listingStruct)
        .then(function(listingVersion){
            listingStruct.listingBody = {
                latestDraftId: null,
                latestPublishId: listingVersion.id
            };
            listingStruct.listingResult = {
                id: listingVersion.ListingId
            };
            updateListing(listingStruct).then(function(listing){
                resolve(listingVersion);
            }).catch(function(err){
                reject(err);
            });

        }).catch(function(err){
            reject(err);
        });
    });
}

exports.createNewDraftAPI = function(listingStruct){
    return new Promise(function(resolve, reject){
        copyListingVersion(listingStruct).then(function(listingVersion){
            resolve(listingVersion);
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.updateListingAPI = function(updateData){
    return new Promise(function(resolve, reject){
        updateListingVersion(updateData)
        .then(findListingVersion)
        .then(function(listing){
             resolve(listing);
         }).catch(function(err){
             reject(err);
         });
    });
}
