const models = require("./models")

var find = function(tenant){
    return new Promise(function(resolve, reject){
        models.Tenant.findOne({
           where: {
               id: tenant.id
           }
        }).then(function(tenant){
            ret = {
                tenant:tenant 
            }
            resolve(ret);
        }).catch(function(err){
            reject(err);
        });
    });
}

var create = function(body){
    return new Promise(function(resolve, reject){
        models.Tenant.create(body).then(function(tenant){
            resolve(tenant);
        }).catch(function(err){
            reject(err);
        });
    });
}

var update = function(update){
    return new Promise(function(resolve, reject){
        models.Tenant.update(
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
        models.Tenant.findAndCountAll({
            where: where,
            limit: limit,
            offset: offset,
            attributes: ['id', 'tenant', 'space', 'leaseEnds', 'ListingVersionId']
        }).then(tenant => {
            var ret = {
                page: page,
                perPage: limit,
                tenants: tenant 
            };
            resolve(ret);
        }).catch(err => {
            reject(err);
        });
    });
}

exports.getTenants = function(page, limit, offset, where){
    return new Promise(function(resolve, reject){
        index(page, limit, offset, where).then(function(tenants){
            resolve(tenants);
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.updateTenant = function(updateData){
    return new Promise(function(resolve, reject){
        update(updateData)
        .then(find)
        .then(function(tenant){
            resolve(tenant);
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.createTenant = function(body){
    return new Promise(function(resolve, reject){
        create(body)
        .then(find)
        .then(function(tenant){
            resolve(tenant);
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.copyTenant = function(id, ListingVersionId){
    return new Promise(function(resolve, reject){
        models.Tenant.findOne({
           where: {
               id: id
           }
        }).then(function(tenant){
            var body = tenant.get({plain: true});
            delete body["id"];
            body.ListingVersionId = ListingVersionId;
            for (var propName in body) {
                if (body[propName] === null || body[propName] === undefined) {
                    delete body[propName];
                }
            }
            create(body).then(function(tenant){
                resolve(tenant);
            }).catch(function(err){
                reject(err);
            });
            return null;
        }).catch(function(err){
            reject(err);
        });
    });
}
