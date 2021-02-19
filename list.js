const models = require('./models');
const jwt = require('./jwt');

exports.createMe = function(authParams, body, t){
    return new Promise(function(resolve, reject){
        jwt.verifyToken(authParams).then(function(jwtResult){
            body.owner = jwtResult["cognito:username"];
            models.List.create(body, {transaction: t}).then(function(list){
                resolve(list);
            }).catch(function(err){
                reject(err);
            });
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.indexMe = function(authParams, paginationParams){
    return new Promise(function(resolve, reject){
        jwt.verifyToken(authParams).then(function(jwtResult){ 
            where = { owner: jwtResult["cognito:username"]};
            models.List.findAndCountAll({
                where: where,
                limit: paginationParams.limit,
                offset: paginationParams.offset,
                attributes: ['id', 'name', 'order']
            }).then(lists => {
                var ret = {
                    page: paginationParams.page,
                    perPage: paginationParams.limit,
                    lists: lists
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

exports.updateMe = function(authParams, id, body, t){
    return new Promise(function(resolve, reject){
        jwt.verifyToken(authParams).then(function(jwtResult){
            models.List.update(
                body,
                {
                    returning: true,
                    where: {id: id},
                    transaction: t
                }
            ).then(function([rowsUpdate, [list]]){
                resolve(list);
            }).catch(function(err){
                reject(err);
            });
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.deleteMe = function(authParams, id, t){
    return new Promise(function(resolve, reject){
        jwt.verifyToken(authParams).then(function(jwtResult){
            models.List.destroy({
                where: {id: id},
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

