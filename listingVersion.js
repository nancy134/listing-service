const models = require("./models");
const spaceService = require("./space");
const unitService = require("./unit");
const tenantService = require("./tenant");
const portfolioService = require("./portfolio");
const imageService = require("./image");
const { Op } = require("sequelize");
const _ = require("lodash");
const Sequelize = require('sequelize');

function desymbolize(o) {
  if (Array.isArray(o)) {
    return o.map(desymbolize);
  } else if (typeof o != "object") {
    return o;
  } else {
    let d = Object.assign(Object.create(Object.getPrototypeOf(o)), o);
    Object.getOwnPropertySymbols(o).forEach(k => {
      d[`<${Symbol.keyFor(k)}>`] = o[k];
      delete d[k];
    });
    Object.keys(d).forEach(k => d[k] = desymbolize(d[k]));
    return d;
  }
}

exports.buildListingWhereClauses = function(req, listingMode, username){
    // Listing Type
    var listingTypes = null;
    if (req.query.ListingType){
       if (req.query.ListingType !== 'All'){
           listingTypes = [req.query.ListingType];
       }
    }

    // Location
    var contains = "";
    if (req.query.lat0){
        var lat0 = req.query.lat0;
        var lng0 = req.query.lng0;
        var lat1 = req.query.lat1;
        var lng1 = req.query.lng1;
        var a = lat0 + " " + lng0;
        var b = lat1 + " " + lng0;
        var c = lat1 + " " + lng1;
        var d = lat0 + " " + lng1;
        var e = lat0 + " " + lng0;
        var boundingBox = `${a},${b},${c},${d},${e}`;
        var geom = Sequelize.fn('ST_GEOMFROMTEXT', boundingBox);
        contains = Sequelize.fn(
            'ST_CONTAINS',
            Sequelize.fn('ST_POLYFROMTEXT', `POLYGON((${a},${b},${c},${d},${e}))`, 4326),
            Sequelize.col('location')
        );
    }
    // Property user
    var propertyUse = null;
    if (req.query.spaceUse){
        propertyUse = {propertyTypes: { [Op.overlap]: req.query.spaceUse }};
    }
    // Owner & publishStatus
    if (listingMode === "myListings"){
        where = {
            [Op.and]: [
                {owner: username},
                propertyUse,
                {[Op.or]: [
                    {[Op.and]: [
                        {publishStatus: 'Draft'},
                        contains
                    ]}, 
                    {[Op.and]: [ 
                        {publishStatus: 'On Market'},
                        {'$listing.latestDraftId$': null},
                        contains
                    ]} 
                ]}
            ]
        };
    } else {
        where = 
        {
            [Op.and]: [
                propertyUse,
                {publishStatus: 'On Market'},
                contains
            ]
        };
    }
    if (listingTypes) where.listingType = {[Op.or]: listingTypes};
    var spaceWhere = null;
    var spaceAndClause = {};

    // Use
    /*
    if (req.query.spaceUse){
        spaceAndClause.use = { [Op.or]: req.query.spaceUse} 
    }
    */
    // Size
    if (req.query.minSize && req.query.maxSize){
        spaceAndClause.size = {[Op.gte]: req.query.minSize, [Op.lte]: req.query.maxSize};
    } else if (req.query.minSize && !req.query.maxSize){
        spaceAndClause.size = {[Op.gte]: req.query.minSize};
    } else if (!req.query.minSize && req.query.maxSize){
        spaceAndClause.size = {[Op.lte]: req.query.maxSize};
    }

    // Price 
    if (req.query.minRate && req.query.maxRate){
        spaceAndClause.price = {[Op.gte]: req.query.minRate, [Op.lte]: req.query.maxRate};
    } else if (req.query.minRate && !req.query.maxRate){
        spaceAndClause.price = {[Op.gte]: req.query.minRate};
    } else if (!req.query.minRate && req.query.maxRate){
        spaceAndClause.price = {[Op.lte]: req.query.maxRate};
    }
    var isEmpty = _.isEmpty(spaceAndClause); 
    if (!isEmpty){
        spaceWhere = {
            [Op.and]: spaceAndClause
        };
        sW = desymbolize(spaceWhere);
    }
    ret = {
        where: where,
        spaceWhere: spaceWhere
    }
    return ret;
}
exports.index = function(paginationParams, whereClauses){
    var page = paginationParams.page;
    var limit = paginationParams.limit;
    var offset = paginationParams.offset;
    var where = whereClauses.where;
    var spaceWhere = whereClauses.spaceWhere;
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
            order: [
                ['updatedAt', 'DESC'],
                [
                    {model: models.Image, as: 'images'},
                    'order',
                    'ASC'
                ]
            ],
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
                attributes: ['price', 'priceUnit', 'size', 'use']
            },
            {
                model: models.Listing,
                as: 'listing',
                attributes: ['latestDraftId', 'latestApprovedId'],
                required: true
            },
            //{
            //    model: models.User,
            //    as: 'users',
            //    where: {id: 2},
            //    attributes: ['id', 'email']
            //}
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

exports.indexOnMarket = function(page, limit, offset){
    return new Promise(function(resolve, reject){
        models.ListingVersion.findAndCountAll({
            where: { publishStatus: "On Market" },
            attributes: [ 'id', 'ListingId', 'publishStatus' ]
        }).then(function(listings){
            var ret = {
                page: page,
                perPage: limit,
                listings: listings
            };
            resolve(ret);
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.indexMarkers = function(paginationParams, whereClauses){
    var page = paginationParams.page;
    var limit = paginationParams.limit;
    var offset = paginationParams.offset;
    var where = whereClauses.where;
    var spaceWhere = whereClauses.spaceWhere;
    return new Promise(function(resolve, reject){
        models.ListingVersion.findAndCountAll({
            where: where,
            distinct: true,
            limit: limit,
            offset: offset,
            attributes: [
                'id',
                'location',
                'address',
                'city',
                'state',
                'publishStatus',
                'updatedAt'
            ],
            //order: [['spaces','price','ASC']],
            order: [
                ['updatedAt', 'DESC']
            ],
            include: [
            {
                model: models.Space,
                as: 'spaces',
                where: spaceWhere,
                attributes: []
            },
            {
                model: models.Listing,
                as: 'listing',
                attributes: [],
                required: true
            }
            ]
        }).then(markers => {
            var ret = {
                page: page,
                perPage: limit,
                markers: markers
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
            where: where,
            attributes: ['id','publishStatus','owner', 'createdAt'],
            order: [['id', 'ASC']]
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

findAddress = function(address, city, state, owner){
    return new Promise(function(resolve, reject){
        models.ListingVersion.findAll({
where: {
    [Op.and]: [
        {
            address: address,
            city: city,
            state: state
        },
        {
        [Op.or]: [
        {
            owner: owner
        },
        {
            publishStatus: "On Market"
        }
        ]
        }
    ]
},
            attributes: ['id','address','city','state','publishStatus','owner']
        }).then(function(listings){
            resolve(listings);
        }).catch(function(err){
            resolve(err);
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
                model: models.User,
                as: 'users',
                through: models.ListingUser,
                attributes: ['id', 'email']
            },
            {
                model: models.Image,
                as: 'images',
                attributes: ['id','url','order']
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
                    'priceUnit',
                    'createdAt'
                ],
                include: [
                {
                    model: models.Image,
                    as: 'images',
                    attributes: ['id', 'url','order']
                }
                ]
            },
            {
                model: models.Attachment,
                as: 'attachments',
                attributes: ['id', 'name', 'order', 'url', 'fileType']
            },
            {
                model: models.Unit,
                as: 'units',
                attributes: ['id', 'description', 'numUnits', 'space', 'income']
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
                ],
                [
                    {model: models.Image, as: 'images'},
                    'order',
                    'ASC'
                ]
            ]
        }).then(function(listing){
            ret = {
                listing: listing,
                states: models.ListingVersion.rawAttributes.state.values,
                listingTypes: models.ListingVersion.rawAttributes.listingType.values,
                //propertyTypes: models.ListingVersion.rawAttributes.propertyType.values,
                spaceTypes: models.Space.rawAttributes.type.values,
                spaceUses: models.Space.rawAttributes.use.values,
                spaceDivisibles: models.Space.rawAttributes.divisible.values,
                portfolioTypes: models.Portfolio.rawAttributes.type.values,
                amenities: models.ListingVersion.rawAttributes.amenities.type.options.type.values,
                priceUnits: models.Space.rawAttributes.priceUnit.values,
                propertyTypes: models.ListingVersion.rawAttributes.propertyTypes.type.options.type.values
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

update = function(id, body, t){
    // Need to set INTEGER and DECIMAL to null
    if (body.listingPrice === "") body.listingPrice = null;
    if (body.totalBuildingSize === "") body.totalBuildingSize = null;
    if (body.lotSize === "") body.lotSize = null;
    if (body.taxes === "") body.taxes = null;
    if (body.floors === "") body.floors = null;
    if (body.totalNumberOfUnits === "") body.totalNumberOfUnits = null;
    if (body.ceilingHeight === "") body.ceilingHeight = null;
    if (body.driveInDoors === "") body.driveInDoors = null;
    if (body.loadingDocks === "") body.loadingDocks = null;
    if (body.yearBuilt === "") body.yearBuilt = null;
    if (body.totalAvailableSpace === "") body.totalAvailableSpace = null;
    if (body.nets === "") body.nets = null;


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

updatePropertyUses = function(id, spaceUse, t){
    return new Promise(function(resolve, reject){
        var attributes = ["propertyTypes"];
        findAttributes(id, attributes, t).then(function(listing){
            var propertyTypes = listing.propertyTypes;
            if (propertyTypes.indexOf(spaceUse) === -1){
               propertyTypes.push(spaceUse);
               var body = {
                   propertyTypes: propertyTypes
               };
               update(id,body,t).then(function(updatedListing){
                   resolve(updatedListing);
               }).catch(function(err){
                   reject(err);
               });
            } else {
                resolve(listing);
            }
        }).catch(function(err){
            reject(err);
        }); 
    });
}

deleteAllByListingId = function(listingId, t){
    return new Promise(function(resolve, reject){
        models.ListingVersion.destroy({
            where: {
                ListingId: listingId
            },
            transaction: t
        }).then(function(result){
            resolve(result); 
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.delete = function(id, t){
    return new Promise(function(resolve, reject){
        models.ListingVersion.destroy({
            where: {
                id: id
            },
            transaction: t
        }).then(function(result){
            resolve(result);
        }).catch(function(err){
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
exports.findAddress = findAddress;
exports.create = create;
exports.update = update;
exports.deleteAllByListingId = deleteAllByListingId;
exports.updatePropertyUses = updatePropertyUses;
