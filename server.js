'use strict';

const express = require('express');
const Sequelize = require('sequelize');
const models = require("./models");
//const ListingModel = require('./models/listing');
//const ImageModel = require('./models/image');
const bodyParser = require('body-parser');
const cors = require('cors');
const image = require('./image');
const multer = require('multer');
const upload = multer({dest: 'uploads/'});

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// App
const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('listing-api.phowma.com\n');
});

app.post('/upload', upload.single('image'), function(req, res, next) {
  res.send(req.file);

  /*
  var uploadPromise = image.uploadFile('/usr/app/','image1.jpg','listing','1','1');
  uploadPromise.then(function(result){
      res.json(result);
  }).catch(function(err){
      res.send(err);
  });
  */
});

app.get('/listings', (req, res) => {
    models.Listing.findAll({include: {model: models.Image, as: 'images'} }).then(listings => res.json(listings))
});

app.get('/images', (req, res) => {
    models.Image.findAll().then(images => res.json(images));
});

app.get('/image/:id', (req,res) => {
    models.Image.findOne({
        where: {
            id: req.params.id
        }
    }).then(image => {
        res.json(image);
    }).catch(err => {
        res.json(err);
    });

});

app.get('/listing/:id', (req,res) => {
    models.Listing.findOne({
        where: {
            id: req.params.id
        }
    }).then(listing => {
        res.json(listing);
    });
});

app.post('/image', (req, res) => {
   var description = req.body.description;
   var ListingId = req.body.listingId;
   models.Image.create({
       description: description,
       ListingId: ListingId
   }).then(image => {
       res.json(image);
   }).catch(err => {
       res.json(err);
   });
});
app.post('/listing', (req, res) => {
   var tenant = req.body.tenant;
   var email = req.body.email;
   var address = req.body.address;
   var city = req.body.city;
   var state = req.body.state;
   models.Listing.create({
       tenant: tenant,
       email: email,
       address: address,
       city: city,
       state: state
   }).then(listing => {
       res.json(listing);
   });
});
app.listen(PORT, HOST);
