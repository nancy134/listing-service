const models = require("./models");
const { Op } = require("sequelize");
const jwt = require('./jwt');

exports.createMe = function(authParams, listId, body, t){
    return new Promise(function(resolve, reject){
        jwt.verifyToken(authParams).then(function(jwtResult){
            body.owner = jwtResult["cognito:username"];
            body.ListId = listId;
            models.ListItem.create(body, {transaction: t}).then(function(listItem){
               resolve(listItem);
            }).catch(function(err){
               reject(err);
            });
        }).catch(function(err){
            reject(err);
        });
    })
}

exports.indexMe = function(ListId, authParams, paginationParams){
    return new Promise(function(resolve, reject){
        jwt.verifyToken(authParams).then(function(jwtResult){
            where = {
                owner: jwtResult["cognito:username"],
                ListId: ListId
            }; 
            models.ListItem.findAndCountAll({
                where: where,
                limit: paginationParams.limit,
                offset: paginationParams.offset,
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
                    page: paginationParams.page,
                    perPage: paginationParams.limit,
                    listItems: listItems
                };
                resolve(ret);
            }).catch(err => {
                reject(err);
            });
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.deleteListItemMe = function(id, authParams, t){
    return new Promise(function(resolve, reject){
        jwt.verifyToken(authParams).then(function(jwtResult){
            models.ListItem.destroy({
                where: {
                    id: id,
                    owner: jwtResult["cognito:username"]
                },
                transaction: t
            }).then(function(result){
                resolve(result);
            }).catch(function(err){
                reject(err);
            });
        }).catch(function(err){
            reject(err);
        });
    });
}

