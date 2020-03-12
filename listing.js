const models = require("./models");
var find = function(listing){
    return new Promise(function(resolve, reject){
        models.Listing.findOne({
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
                states: models.Listing.rawAttributes.state.values,
                listingTypes: models.Listing.rawAttributes.listingType.values,
                propertyTypes: models.Listing.rawAttributes.propertyType.values,
                spaceTypes: models.Space.rawAttributes.type.values,
                spaceUse: models.Space.rawAttributes.use.values                
            };
            resolve(ret);
        }).catch(function(err){
            reject(err);
        });
    });
}
var update = function(update){
    return new Promise(function(resolve, reject){
        models.Listing.update(
            update.body,
            {returning: true, where: {id: update.id}}
        ).then(function([rowsUpdate, [listing]]){
            resolve(listing);
        }).catch(function(err){
            reject(err);
        });
    });
}
var create = function(body){
    return new Promise(function(resolve, reject){
        models.Listing.create(body).then(function(listing){
            resolve(listing);
        }).catch(function(err){
            reject(err);
        });
    });
}
var index = function(page, limit, offset, where){
    return new Promise(function(resolve, reject){
        models.Listing.findAndCountAll({
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
exports.getListings = function(page, limit, offset, where){
    return new Promise(function(resolve, reject){
        index(page, limit, offset, where).then(function(listings){
            resolve(listings);
        }).catch(function(err){
            reject(err);
        }); 
    });    
}
exports.getListing = function(id){
    var listing = {id: id};
    return new Promise(function(resolve, reject){
        find(listing).then(function(listing){
            resolve(listing);
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.createListing = function(body){
    return new Promise(function(resolve, reject){
        create(body)
        .then(find)
        .then(function(listing){
            resolve(listing);
        }).catch(function(err){
            reject(err);
        });
    });
}
exports.updateListing = function(updateData){
    return new Promise(function(resolve, reject){
        update(updateData)
        .then(find)
        .then(function(listing){
             resolve(listing);
         }).catch(function(err){
             reject(err);
         });
    });
}
