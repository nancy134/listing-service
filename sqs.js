const AWS = require('aws-sdk');
const { Consumer } = require('sqs-consumer');
const userService = require('./user');

AWS.config.update({region: 'us-east-1'});
const newUserQueueUrl = process.env.AWS_SQS_NEW_USER_LISTING_QUEUE

exports.handleSQSMessage = function(message){
    var json = JSON.parse(message.Body);
    var json2 = JSON.parse(json.Message);
    var body = {
        email: json2.email,
        cognitoId: json2.userSub,
        role: json2.role
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

exports.sqsApp = Consumer.create({
    queueUrl: newUserQueueUrl,
    handleMessage: module.exports.handleSQSMessage,
    sqs: new AWS.SQS()
});

exports.handleError = function(err){
    console.log(err);
}

module.exports.sqsApp.on('error', (err) => {
    module.exports.handleError(err);
});

module.exports.sqsApp.on('processing_error', (err) => {
    module.exports.handleError(err);
});
module.exports.sqsApp.start();
