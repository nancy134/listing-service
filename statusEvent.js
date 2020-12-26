const models = require("./models")

exports.create = function(body,t){
    return new Promise(function(resolve, reject){
        models.StatusEvent.create(body, {transaction: t}).then(function(statusEvent){
            resolve(statusEvent);
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.index = function(page, limit, offset, where){
    return new Promise(function(resolve, reject){
        models.StatusEvent.findAndCountAll({
            where: where,
            limit: limit,
            offset: offset,
            attributes: ['id', 'ListingId', 'publishStatus','createdAt', 'owner']
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

exports.findLastOnMarketEvent = function(ListingId){
    return new Promise(function(resolve, reject){
        models.StatusEvent.findAndCountAll({
            where: { ListingId: ListingId, publishStatus: "On Market"},
            order: [['createdAt', 'DESC']] 
        }).then(function(statusEvents){
            if (statusEvents.rows.length > 0){
                var ret = statusEvents.rows[0]
            } else {
                var ret = "empty rows";
            }
            resolve(ret);
        }).catch(function(err){
            reject(err);
        }); 
    });
}

