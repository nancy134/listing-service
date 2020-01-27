const fs = require('fs');
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});


exports.uploadFile = (path,fileName,table,tableIndex,imageIndex) => {
    return new Promise(function(resolve, reject){
        var filePath = path + fileName;
        fs.readFile(filePath, (err, data) => {
            if (err){
                reject(err);
            }
            var key = 
                table + "/" +
                tableIndex + "/" +
                imageIndex + "/" +
                fileName;
                 
            const params = {
                Bucket: 'sabre-images', 
                Key: 'listing/1/image/1/image1.jpg', 
                Body: JSON.stringify(data, null, 2)
            };
            s3.upload(params, function(s3Err, data) {
                if (s3Err) {
                    reject(s3Err);
                } else {
                    resolve(data);
                }
            });
        });
    });
};
