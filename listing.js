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
            console.log("err: "+err);
            reject(err);
        });
    });
}

exports.create = function(body){
    return new Promise(function(resolve, reject){
        models.Listing.create(body).then(function(listing){
            resolve(listing);
        }).catch(function(err){
            console.log("createListing: err: "+err);
            reject(err);
        });
    });
}

exports.update = function(id, body){
    console.log("id: "+id);
    console.log("body: "+JSON.stringify(body));
    return new Promise(function(resolve, reject){
        models.Listing.update(
            body,
            {returning: true, where: {id: id}}
        ).then(function([rowsUpdate, [listing]]){
            console.log("listing: "+JSON.stringify(listing));
            resolve(listing);
        }).catch(function(err){
            console.log("updateListing err: "+err);
            reject(err);
        });
    });
}
