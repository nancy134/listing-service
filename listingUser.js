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

createSystem = function(body, t){
    return new Promise(function(resolve, reject){
        models.ListingUser.create(body, {transaction: t}).then(function(broker){
            resolve(broker);
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.createBroker = function(body, t){
    return new Promise(function(resolve, reject){
        createSystem(body, t).then(function(broker){
            resolve(broker);
        }).catch(function(err){
            reject(err);
        });
    });
}

var find = function(id, t){
    return new Promise(function(resolve, reject){
        models.ListingUser.findOne({
            where: {
                id: id
            },
            transaction: t
        }).then(function(broker){
            resolve(broker);
        }).catch(function(err){
            reject(err);
        });
    });
}

var findWithPrevious = function(id, t){
    return new Promise(function(resolve, reject){
        models.ListingUser.findOne({
            where: {
                PreviousVersionid: id
            },
            transaction: t
        }).then(function(broker){
            resolve(broker);
        }).catch(function(err){
            reject(err);
        });
    });
}

var update = function(id, body, t){
    return new Promise(function(resolve, reject){
        models.ListingUser.update(
            body,
            {
                returning: true,
                where: {id: id},
                transaction: t
            }
        ).then(function([rowsUpdate, [broker]]){
            resolve(broker);
        }).catch(function(err){
            reject(err);
        });
    });
}

var deleteBroker = function(id, t){
    return new Promise(function(resolve, reject){
        models.ListingUser.destroy({
            where: {id: id},
            transaction: t
        }).then(function(result){
            resolve(result);
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.createAPI = function(body)
{
    return new Promise(function(resolve, reject){
        listingAPIService.createAssociationAPI(body, "broker").then(function(createdBroker){
            resolve(createdImage);
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.updateAPI = function(id, body){
    return new Promise(function(resolve, reject){
        listingAPIService.updateAssociationAPI(id, body, "broker").then(function(updatedBroker){
            resolve(updatedImage);
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.deleteAPI = function(id){
    return new Promise(function(resolve, reject){
        listingAPIService.deleteAssociationAPI(id, "broker").then(function(deletedBroker){
            resolve(deletedImage);
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.copyBroker = function(id, ListingVersionId, newListingVersionId, t){
    return new Promise(function(resolve, reject){
        models.ListingUser.findOne({
            where: {
                UserId: id,
                ListingVersionId
            },
            transaction: t
        }).then(function(broker){
            var body = {};
            body.ListingVersionId = newListingVersionId;
            body.UserId = id;
            body.PreviousVersionId = broker.id;
            createSystem(body, t).then(function(broker){
                resolve(broker);
            }).catch(function(err){
                reject(err);
            });
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.find = find;
exports.update = update;
exports.findWithPrevious = findWithPrevious;
exports.deleteBroker = deleteBroker;
