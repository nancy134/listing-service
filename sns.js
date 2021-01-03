const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const billingEventTopicARN = "arn:aws:sns:us-east-1:461318555119:billing-event";

exports.billingEvent = function(billingData){
    return new Promise(function(resolve, reject){
        var params = {
            Message: JSON.stringify(billingData),
            TopicArn: billingEventTopicARN
        };
        var publishPromise = new AWS.SNS({apiVersion: '2010-03-31'}).publish(params).promise();
        publishPromise.then(function(data){
            resolve(data);
        }).catch(function(err){
            reject(err);
        });
    });
}

