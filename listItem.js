const models = require("./models");
const { Op } = require("sequelize");

var create = function(body, t){
    return new Promise(function(resolve, reject){
        models.ListItem.create(body, {transaction: t}).then(function(listItem){
            resolve(listItem);
        }).catch(function(err){
            reject(err);
        });
    });
}

var index2 = function(page, limit, offset, where){
    return new Promise(function(resolve, reject){
        models.ListItem.findAndCountAll({
            where: where,
            limit: limit,
            offset: offset,
            attributes: ['id', 'ListId', 'ListingId']
        }).then(listItems => {
            resolve(listItems);
        }).catch(function(err){
            reject(err);
        });
    });
}

var index = function(page, limit, offset, where){
    return new Promise(function(resolve, reject){
        models.ListItem.findAndCountAll({
            where: where,
            limit: limit,
            offset: offset,
            distinct: true,
            attributes: ['id', 'ListId', 'ListingId'],
            include: [{
                model: models.Listing,
                as: 'listing',
                required: true,
                attributes: ['latestApprovedId'],
                where: { 'latestApprovedId': {[Op.ne]: null}},
                include: [{
                    model: models.ListingVersion,
                    as: 'versions',
                    where: { 'publishStatus': 'On Market'},
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
                        'updatedAt'
                    ],
                    include: [
                    {
                        model: models.Space,
                        as: 'spaces',
                        attributes: ['price', 'priceUnit', 'size', 'use']
                    }

                    ]
                }]  
            }]
        }).then(listItems => {
            var ret = {
                page: page,
                perPage: limit,
                listItems: listItems
            };
            resolve(ret);
        }).catch(err => {
            console.log(err);
            reject(err);
        });
    });
}

var deleteListItem = function(id, t){
    return new Promise(function(resolve, reject){
        models.ListItem.destroy({
            where: {id: id},
            transaction: t
        }).then(function(result){
            resolve(result);
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.create = create;
exports.index = index;
exports.index2 = index2;
exports.deleteListItem = deleteListItem;
