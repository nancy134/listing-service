const AWS = require('aws-sdk');
const { Consumer } = require('sqs-consumer');
const userService = require('./user');

AWS.config.update({region: 'us-east-1'});
const newUserQueueUrl = process.env.AWS_SQS_NEW_USER_LISTING_QUEUE
const updateUserQueueUrl = process.env.AWS_SQS_UPDATE_USER_LISTING_QUEUE

exports.handleSQSMessage = function(message){
    var json = JSON.parse(message.Body);
    var json2 = JSON.parse(json.Message);
    var body = {
        email: json2.email,
        cognitoId: json2.userSub,
        role: json2.role,
        AssociationId: json2.AssociationId
    };
    userService.findByEmail(body.email).then(function(user){
        if (!user){
            userService.systemCreate(body).then(function(result){
            }).catch(function(err){
            });
        } else {
            userService.systemupdate(user.id, body).then(function(result){
            }).catch(function(err){
            });
        }
    }).catch(function(err){
    });

}

exports.handleUpdateUserMessage = function(message){
    var json = JSON.parse(message.Body);
    var json2 = JSON.parse(json.Message);

    var userBody = {};
    if (json2.role) userBody.role = json2.role;
    if (json2.AssociationId) userBody.AssociationId = json2.AssociationId;
    if (json2.cognitoId) userBody.cognitoId = json2.cognitoId;
    if (json2.email) userBody.email = json2.email;

    if (json2.cognitoId){
        userService.findByCognitoId(json2.cognitoId).then(function(user){
            if (json2.email){
                userService.findByEmail(json2.email).then(function(user2){
                    userService.systemUpdate(user2.id, userBody).then(function(user3){
                    }).catch(function(err){
                     });
                }).catch(function(err){
                });
            } else {
               // Error not found
            }
        }).catch(function(err){
        });
    } else if (json2.email){
        userService.findByEmail(json2.email).then(function(user4){
            if (user4){
                userService.systemUpdate(user4.id, userBody).then(function(user5){
                }).catch(function(err){
                });
            } else {
                userService.systemCreate(userBody).then(function(user6){
                }).catch(function(err){
                });
           }
        }).catch(function(err){
        });
    }
}

exports.sqsApp = Consumer.create({
    queueUrl: newUserQueueUrl,
    handleMessage: module.exports.handleSQSMessage,
    sqs: new AWS.SQS()
});

exports.sqsUpdateUser = Consumer.create({
    queueUrl: updateUserQueueUrl,
    handleMessage: module.exports.handleUpdateUserMessage,
    sqs: new AWS.SQS()
});

exports.handleError = function(err){
    console.log(err);
}

module.exports.sqsApp.on('error', (err) => {
    module.exports.handleError(err);
});
module.exports.sqsUpdateUser.on('error', (err) => {
    module.exports.handleError(err);
});

module.exports.sqsApp.on('processing_error', (err) => {
    module.exports.handleError(err);
});
module.exports.sqsUpdateUser.on('processing_error', (err) => {
    module.exports.handleError(err);
});

module.exports.sqsApp.start();
module.exports.sqsUpdateUser.start();
