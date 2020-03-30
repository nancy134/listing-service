const models = require("./models")

var find = function(space){
    return new Promise(function(resolve, reject){
        models.Space.findOne({
           where: {
               id: space.id
           }
        }).then(function(space){
            ret = {
                space: space
            }
            resolve(ret);
        }).catch(function(err){
            reject(err);
        });
    });
}

var create = function(body){
    return new Promise(function(resolve, reject){
        models.Space.create(body).then(function(space){
            resolve(space);
        }).catch(function(err){
            reject(err);
        });
    });
}

var update = function(update){
    return new Promise(function(resolve, reject){
        models.Space.update(
            update.body,
            {returning: true, where: {id: update.id}}
        ).then(function([rowsUpdate, [listing]]){
            resolve(listing);
        }).catch(function(err){
            reject(err);
        });
    });
}

var index = function(page, limit, offset, where){
    return new Promise(function(resolve, reject){
        models.Space.findAndCountAll({
            where: where,
            limit: limit,
            offset: offset,
            attributes: ['id', 'unit', 'size', 'type', 'use', 'ListingVersionId']
        }).then(spaces => {
            var ret = {
                page: page,
                perPage: limit,
                spaces: spaces
            };
            resolve(ret);
        }).catch(err => {
            reject(err);
        });
    });
}

exports.getSpaces = function(page, limit, offset, where){
    return new Promise(function(resolve, reject){
        index(page, limit, offset, where).then(function(spaces){
            resolve(spaces);
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.updateSpace = function(updateData){
    return new Promise(function(resolve, reject){
        update(updateData)
        .then(find)
        .then(function(space){
            resolve(space);
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.createSpace = function(body){
    return new Promise(function(resolve, reject){
        create(body)
        .then(find)
        .then(function(space){
            resolve(space);
        }).catch(function(err){
            reject(err);
        });
    });
}
