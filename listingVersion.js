const models = require("./models");
const spaceService = require("./space");
const unitService = require("./unit");
const tenantService = require("./tenant");
const portfolioService = require("./portfolio");
const imageService = require("./image");

exports.index = function(page, limit, offset, where, spaceWhere){
    return new Promise(function(resolve, reject){
        models.ListingVersion.findAndCountAll({
            where: where,
            distinct: true,
            limit: limit,
            offset: offset,
            attributes: [
                'id',
                'listingType', 
                'listingPrice', 
                'address', 
                'city',
                'state',
                'zip',
                'displayAddress', 
                'yearBuilt', 
                'owner', 
                'publishStatus', 
                'shortDescription',
                'location',
                'ListingId', 
                'createdAt',
                'updatedAt'],
            //order: [['spaces','price','ASC']],
            order: [['updatedAt', 'DESC']],
            include: [
            {
                model: models.Image, 
                as: 'images',
                attributes: ['id','url','order']
            },
            {
                model: models.Space,
                as: 'spaces',
                where: spaceWhere,
                attributes: ['price', 'size', 'use']
            },
            {
                model: models.Listing,
                as: 'listing',
                attributes: ['latestDraftId', 'latestApprovedId'],
                required: true
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
            attributes: ['id','publishStatus','owner', 'createdAt'],
        }).then(listings => {
            resolve(listings); 
        }).catch(err => { 
            reject(err);
        });
    });
}
findAttributes = function(id, attributes, t){
    return new Promise(function(resolve, reject){
        models.ListingVersion.findOne({
            where: {
               id: id
            },
            attributes: attributes,
            transaction: t
        }).then(function(listing){
            resolve(listing);
        }).catch(function(err){
            reject(err);
        });;
    });
}

findRelated = function(listingId, t){
    console.log("listingId: "+listingId);
    return new Promise(function(resolve, reject){
        models.ListingVersion.findAll({
            where: {
                ListingId: listingId
            },
            attributes: ['id'],
            transaction: t 
        }).then(function(listings){
            resolve(listings);
        }).catch(function(err){
            reject(err);
        });
    });
}

find = function(id, t){
    return new Promise(function(resolve, reject){
        models.ListingVersion.findOne({
            where: {
                id: id 
            },
            transaction: t,
            include: [
            {
                model: models.Image,
                as: 'images',
                attributes: ['id','url']
            },
            {
                model: models.Space,
                as: 'spaces',
                attributes: [
                    'id',
                    'unit',
                    'price',
                    'size',
                    'type',
                    'use',
                    'description',
                    'driveInDoors',
                    'floors',
                    'divisible',
                    'loadingDocks',
                    'leaseTerm',
                    'ceilingHeight',
                    'availableDate',
                    'nets',
                    'class',
                    'createdAt'
                ],
                include: [
                {
                    model: models.Image,
                    as: 'images',
                    attributes: ['id', 'url']
                }
                ]
            },
            {
                model: models.Unit,
                as: 'units',
                attribute: ['id', 'description', 'numUnits', 'space', 'income']
            },
            {
                model: models.Tenant,
                as: 'tenants',
                attributes: ['id', 'tenant', 'space', 'baseRent', 'leaseEnds']
            },
            {
                model: models.Portfolio,
                as: 'portfolios',
                attributes: ['id', 'tenant', 'buildingSize', 'lotSize', 'type']
            },
            {
                model: models.Listing,
                as: 'listing',
                attributes: ['latestDraftId', 'latestApprovedId']
            }
            ],
            order: [
                [
                    {model: models.Space, as: 'spaces'},
                    'createdAt',
                    'DESC'
                ]
            ]
        }).then(function(listing){
            ret = {
                listing: listing,
                states: models.ListingVersion.rawAttributes.state.values,
                listingTypes: models.ListingVersion.rawAttributes.listingType.values,
                propertyTypes: models.ListingVersion.rawAttributes.propertyType.values,
                spaceTypes: models.Space.rawAttributes.type.values,
                spaceUses: models.Space.rawAttributes.use.values,
                spaceDivisibles: models.Space.rawAttributes.divisible.values,
                portfolioTypes: models.Portfolio.rawAttributes.type.values,
                amenities: models.ListingVersion.rawAttributes.amenities.type.options.type.values
            };
            resolve(ret);
        }).catch(function(err){
            reject(err);
        });
    });
}

create = function(body, t){
    body.publishStatus = "Draft";
    return new Promise(function(resolve, reject){
        models.ListingVersion.create(body, {transaction: t}).then(function(listing){
            resolve(listing);
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.update = function(id, body, t){
    return new Promise(function(resolve, reject){
        models.ListingVersion.update(
            body,
            {transaction: t, returning: true, where: {id: id}}
        ).then(function([rowsUpdate, [listing]]){
            resolve(listing);
        }).catch(function(err){
            reject(err);
        });
    });
}

deleteAllByListingId = function(listingId, t){
    console.log("deleteAllByListingId: "+listingId);
    return new Promise(function(resolve, reject){
        models.ListingVersion.destroy({
            where: {
                ListingId: listingId
            },
            transaction: t
        }).then(function(result){
            console.log("deleteAllByListingId: result: "+JSON.stringify(result));
            resolve(result); 
        }).catch(function(err){
            console.log("deleteAllByListingId: err: "+err);
            reject(err);
        });
    });
}

exports.copy = function(id, t){
    return new Promise(function(resolve, reject){
        this.find(id, t).then(function(listingVersion){
            var body = listingVersion.listing.get({plain: true});
            delete body.id;
            delete body.updatedAt;
            delete body.createdAt;

            var spaces = body.spaces
            delete body.spaces;
            var units = body.units;
            delete body.units;
            var tenants = body.tenants;
            delete body.tenants;
            var portfolios = body.portfolios;
            delete body.portfolios;
            var images = body.images;

            for (var propName in body) { 
                if (body[propName] === null || body[propName] === undefined) {
                    delete body[propName];
                }
            }
            create(body, t).then(function(newListingVersion){
                var promises = [];
                for (var index in spaces){
                    var copyPromise = spaceService.copySpace(
                        spaces[index].id, 
                        newListingVersion.id,
                        t);
                    promises.push(copyPromise);
                }
                for (var index in units){
                    var copyPromise = unitService.copyUnit(
                        units[index].id,
                        newListingVersion.id,
                        t);
                    promises.push(copyPromise);
                }
                for (var index in tenants){
                    var copyPromise = tenantService.copyTenant(
                        tenants[index].id,
                        newListingVersion.id,
                        t);
                    promises.push(copyPromise);
                }
                for (var index in portfolios){
                    var copyPromise = portfolioService.copyPortfolio(
                        portfolios[index].id,
                        newListingVersion.id,
                        t);
                    promises.push(copyPromise);
                }
                for (var index in images){
                    var copyPromise = imageService.copyImage(
                        images[index].id,
                        newListingVersion.id,
                        t);
                    promises.push(copyPromise);
                }

                Promise.all(promises).then(function(values){
                    resolve(newListingVersion);
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

exports.find = find;
exports.findAttributes = findAttributes;
exports.findRelated = findRelated;
exports.create = create;
exports.deleteAllByListingId = deleteAllByListingId;
