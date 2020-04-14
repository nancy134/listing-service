const models = require("./models");

exports.find = function(id){
    return new Promise(function(resolve, reject){
        models.Listing.findOne({
            where: {
                id: id
            },
        }).then(function(listing){
            resolve(listing);
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.indexAdmin = function(page, limit, offset, where){
    return new Promise(function(resolve, reject){
        models.Listing.findAll({
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

exports.update = function(id, body){
    return new Promise(function(resolve, reject){
        models.Listing.update(
            body,
            {returning: true, where: {id: id}}
        ).then(function([rowsUpdate, [listing]]){
            resolve(listing);
        }).catch(function(err){
            reject(err);
        });
    });
}
