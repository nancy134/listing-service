const models = require('./models');
const jwt = require('./jwt');
const utilities = require('./utilities');

exports.create = function(authParams, body){
    return new Promise(function(resolve, reject){
        jwt.verifyToken(authParams).then(function(jwtResult){
            // Am I Association Administrator or owner of listing
            models.ListingUser.create(body).then(function(listingUser){
                resolve(listingUser);
            }).catch(function(err){
                reject(err);
            });
        }).catch(function(err){
            reject(err);
        });
    });
}

