const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

exports.deleteFromS3 = function(url){
    var url_parts = require('url').parse(url, true);
    var key = url_parts.pathname.substring(1);
    var params = {
        Bucket: process.env.S3_BUCKET,
        Key: key
    };
    s3.deleteObject(params, function(err, data){
        if (err) console.log(err);
    }); 
}
