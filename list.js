const models = require('./models')

var create = function(body, t){
    return new Promise(function(resolve, reject){
        models.List.create(body, {transaction: t}).then(function(list){
            resolve(list);
        }).catch(function(err){
            reject(err);
        });
    });
}

var index = function(page, limit, offset, where){
    return new Promise(function(resolve, reject){
        models.List.findAndCountAll({
            where: where,
            limit: limit,
            offset: offset,
            attributes: ['id', 'name', 'order']
        }).then(lists => {
            var ret = {
                page: page,
                perPage: limit,
                lists: lists
            };
            resolve(ret);
        }).catch(err => {
            reject(err);
        });
    });
}

exports.create = create;
exports.index = index;
