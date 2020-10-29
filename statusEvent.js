const models = require("./models")

var create = function(body,t){
    return new Promise(function(resolve, reject){
        models.StatusEvent.create(body, {transaction: t}).then(function(statusEvent){
            resolve(statusEvent);
        }).catch(function(err){
            reject(err);
        });
    });
}

var index = function(page, limit, offset, where){
    return new Promise(function(resolve, reject){
        models.StatusEvent.findAndCountAll({
            where: where,
            limit: limit,
            offset: offset,
            attributes: ['id', 'ListingId', 'publishStatus','createdAt']
        }).then(statusEvent => {
            var ret = {
                page: page,
                perPage: limit,
                statusEvents: statusEvent
            };
            resolve(ret);
        }).catch(err => {
            reject(err);
        });
    });
}

exports.create = create;
exports.index = index;

