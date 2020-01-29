const fs = require('fs');
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});


exports.uploadFile = (path,fileName,table,tableIndex,imageIndex) => {
    console.log("path: "+path);
    console.log("fileName: "+fileName);
    console.log("table: "+table);
    console.log("tableIndex: "+tableIndex);
    console.log("imageIndex: "+imageIndex);
    return new Promise(function(resolve, reject){
        var filePath = "./"+path;
        console.log("filePath: "+filePath);
        fs.readFile(filePath, (err, data) => {
            if (err){
                reject(err);
            }
            var key = 
                table + "/" +
                tableIndex + "/" +
                'image' + "/" +
                imageIndex + "/" +
                fileName;
                 
            const params = {
                Bucket: 'sabre-images', 
                Key: key, 
                Body: data
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
