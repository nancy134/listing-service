const models = require('./models');
const jwt = require('./jwt');
const utilities = require('./utilities');

// This API is not authenticated
// Should only be used by the listing-service
// Should not be exposed through REST API
exports.systemCreate = function(body){
    return new Promise(function(resolve, reject){
        models.User.create(body).then(function(result){
            resolve(result);
        }).catch(function(err){
            reject(err);
        }); 
    });
}

// This API is not authenticated
// Should only be used by the listing-service
// Should not be exposed through REST API
exports.systemUpdate = function(id, body){
    return new Promise(function(resolve, reject){
        models.User.update(
            body,
            {
                returning: true,
                where: {id: id}
            }
        ).then(function(update){
            if (!update[0]){
                reject({message: "No records update"});
            } else {
                resolve(update[1][0]);
            }
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.index = function(authParams, paginationParams, where){
    var page = paginationParams.page;
    var limit = paginationParams.limit;
    var offset = paginationParams.offset;

    return new Promise(function(resolve, reject){
       jwt.verifyToken(authParams).then(function(jwtResult){
           if (jwt.isAdmin(jwtResult)){
                models.User.findAndCountAll({
                    where: where,
                    distinct: true,
                    limit: limit,
                    offset: offset,
                    attributes: [
                        'id',
                        'email',
                        'cognitoId',
                        'role'
                    ]
                }).then(function(users){
                    var ret = {
                        page: page,
                        perPage: limit,
                        users: users
                    };
                    resolve(ret);
                }).catch(function(err){
                    reject(err);
                });
            } else {
                reject(utilities.notAuthorized());
            }
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.findByEmail = function(email){
    return new Promise(function(resolve, reject){
        models.User.findOne({
            where: {
                email: email
            }
        }).then(function(user){
            resolve(user);
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.findByCognitoId = function(cognitoId){
    return new Promise(function(resolve, reject){
        models.User.findOne({
            where: {
                cognitoId: cognitoId
            }
        }).then(function(user){
            resolve(user);
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.findAllByCognitoId = function(cognitoId){
    return new Promise(function(resolve, reject){
        exports.findByCognitoId(cognitoId).then(function(user){
            var allUsers = [];
            if (user.AssociationId){
                exports.findAllByAssociationId(user.AssociationId).then(function(associates){
                    if (associates){
                        for (var i=0; i<associates.length; i++){
                            allUsers.push(associates[i].id);
                        }
                    }
                    resolve(allUsers);
                }).catch(function(err){
                    reject(err);
                });
            } else {
                allUsers.push(user.id);
                resolve(allUsers);
            }
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.findAllByAssociationId = function(associationId){
    return new Promise(function(resolve, reject){
        models.User.findAll({
           where: {
               AssociationId: associationId
           }
        }).then(function(users){
           resolve(users);
        }).catch(function(err){
           reject(err);
        });
    });
}

exports.getAllAssociates = function(cognitoId){
    return new Promise(function(resolve, reject){
        exports.findByCognitoId(cognitoId).then(function(user){
            var users = [];
            if (user.role === "Administrator"){
                if (user.AssociationId){
                    exports.findAllByAssociationId(user.AssociationId).then(function(associates){
                        if (associates){
                            for (var i=0; i<associates.length; i++){
                                users.push(associates[i].id); 
                            }
                        }
                        resolve(users);
                    }).catch(function(err){
                        reject(err);
                    });
                } else {
                    users.push(user.id);
                    resolve(users);
                }
            } else {
                users.push(user.id);
                resolve(users);
            } 
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.systemUpdate = function(id, body){
    return new Promise(function(resolve, reject){
        models.User.update(
            body,
            {
                returning: true,
                 where: {id: id}
            }
        ).then(function(update){
            if (!update[0]){
                reject({message: "No records updated"});
            } else {
                resolve(update[1][0]);
            }
        }).catch(function(err){
            reject(err);
        });
    });
}
