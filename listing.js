const models = require("./models");
var findListingVersion = function(listing){
    return new Promise(function(resolve, reject){
        models.ListingVersion.findOne({
            where: {
                id: listing.id
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
            reject(err);
        });
    });
}
var updateListingVersion = function(update){
    return new Promise(function(resolve, reject){
        models.ListingVersion.update(
            update.body,
            {returning: true, where: {id: update.id}}
        ).then(function([rowsUpdate, [listing]]){
            resolve(listing);
        }).catch(function(err){
            reject(err);
        });
    });
}
var createListingVersion = function(body){
    return new Promise(function(resolve, reject){
        models.ListingVersion.create(body).then(function(listing){
            resolve(listing);
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
    var listing = {id: id};
    return new Promise(function(resolve, reject){
        findListingVersion(listing).then(function(listing){
            resolve(listing);
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.createListingAPI = function(body){
    return new Promise(function(resolve, reject){
        createListingVersion(body)
        .then(findListingVersion)
        .then(function(listing){
            resolve(listing);
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
