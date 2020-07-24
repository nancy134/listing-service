const models = require("./models");

exports.find = function(id, t){
    return new Promise(function(resolve, reject){
        models.Listing.findOne({
            where: {
                id: id
            },
            transaction: t
        }).then(function(listing){
            resolve(listing);
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.index = function(page, limit, offset, where, mode){
    return new Promise(function(resolve, reject){
        models.Listing.findAndCountAll({
            where: where,
            distinct: true,
            limit: limit,
            offset, offset,
            attributes: ['id', 'latestDraftId', 'latestApprovedId'],
            include: [
            {
                model: models.ListingVersion,
                as: 'latestDraftVersion',
                attributes: ['id','listingType', 'listingPrice', 'address', 'city','state','yearBuilt', 'owner', 'publishStatus', 'ListingId'],
include: [
                {
                    model: models.Image, 
                    as: 'images',
                    attributes: ['id','url','order']
                },
                {
                    model: models.Space,
                    as: 'spaces',
                    attributes: ['price', 'size']
                }
                ]
 
            },
            {
                model: models.ListingVersion,
                as: 'latestApprovedVersion',
                attributes: ['id','listingType', 'listingPrice', 'address', 'city','state','yearBuilt', 'owner', 'publishStatus', 'ListingId'],
                include: [
                {
                    model: models.Image,
                    as: 'images',
                    attributes: ['id','url','order']
                },
                {
                    model: models.Space,
                    as: 'spaces',
                    attributes: ['price', 'size']
                }
                ]

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
        models.Listing.findAll({
            where: where,
            attributes: ['id', 'latestDraftId', 'latestApprovedId']
        }).then(listings => {
            resolve(listings);
        }).catch(err => {
            reject(err);
        });
    });
}


exports.create = function(body){
    return new Promise(function(resolve, reject){
        models.Listing.create(body).then(function(listing){
            resolve(listing);
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.update = function(id, body, t){
    return new Promise(function(resolve, reject){
        models.Listing.update(
            body,
            {
                returning: true, 
                where: {id: id},
                transaction: t
            }
        ).then(function([rowsUpdate, [listing]]){
            resolve(listing);
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.delete = function(id,t){
    return new Promise(function(resolve, reject){
        models.Listing.destroy({
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

