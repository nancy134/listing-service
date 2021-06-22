const models = require('./models');
const jwt = require('./jwt');
const utilities = require('./utilities');
const userService = require('./user');

exports.create = function(authParams, body, t){
    return new Promise(function(resolve, reject){
        jwt.verifyToken(authParams).then(function(jwtResult){
            // Am I Association Administrator or owner of listing
            models.ListingUser.create(body,{transaction: t} ).then(function(listingUser){
                resolve(listingUser);
            }).catch(function(err){
                reject(err);
            });
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.createMe = function(authParams, listingVersionId, t){
    return new Promise(function(resolve, reject){
        jwt.verifyToken(authParams).then(function(jwtResult){
            userService.findByCognitoId(jwtResult["cognito:username"]).then(function(user){
                var listingUserBody = {
                    UserId: user.id,
                    ListingVersionId: listingVersionId
                };
                models.ListingUser.create(listingUserBody, {transaction: t}).then(function(listingUser){
                    resolve(listingUser);
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

exports.deleteListingUser = function(authParms, listingVersionId, userId){
    return new Promise(function(resolve, reject){
        models.ListingUser.destroy({
            where: {
                ListingVersionId: listingVersionId,
                UserId: userId
            }
        }).then(function(result){
           resolve(result);
        }).catch(function(err){
            reject(err);
        });
    });
}


