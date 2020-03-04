'use strict';

const express = require('express');
const Sequelize = require('sequelize');
const models = require("./models");
const bodyParser = require('body-parser');
const cors = require('cors');
const imageService = require('./image');
const multer = require('multer');
const upload = multer({dest: 'uploads/'});
const listingService = require('./listing');

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

  models.Image.create({
      ListingId: req.body.listing_id
  }).then(image => {
      var uploadPromise = imageService.uploadFile(
          req.file.path,
          req.file.originalname,
          'listing',
          req.body.listing_id,
          image.id);
      uploadPromise.then(function(result){
          image.url = result.Location;
          image.save().then(image => {
              res.json(image);
          }).catch(err => {
              res.json(err);
          });
      }).catch(function(err){
          res.send(err);
      });

  }).catch(err => {
      res.send(err);
  });

  /*
  var uploadPromise = image.uploadFile('/usr/app/','image1.jpg','listing','1','1');
  uploadPromise.then(function(result){
      res.json(result);
  }).catch(function(err){
      res.send(err);
  });
  */
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

app.get('/enums', (req, res) => {
    res.json({
        states: models.Listing.rawAttributes.state.values,
        listingTypes: models.Listing.rawAttributes.listingType.values,
        propertyTypes: models.Listing.rawAttributes.propertyType.values,
        spaceTypes: models.Space.rawAttributes.type.values,
        spaceUse: models.Space.rawAttributes.use.values

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

app.get('/listings', (req, res) => {
    var page = req.query.page;
    var limit = req.query.perPage;
    var offset = (parseInt(req.query.page)-1)*parseInt(req.query.perPage);
    var where = null;
    if (req.query.owner) where = {owner: req.query.owner};

   var getListingsPromise = listingService.getListings(page, limit, offset, where);
   getListingsPromise.then(function(result){
       res.json(result);
   }).catch(function(err){
       console.log("err: "+err);
   });
});

app.get('/listing/:id', (req, res) => {
    var getListingPromise = listingService.getListing(req.params.id);
    getListingPromise.then(function(result){
        res.json(result);
    }).catch(function(err){
        console.log("err: "+err);
    });
});
app.put('/listing/:id', (req, res) => {
    var updateData = {
        id: req.params.id,
        body: req.body 
    };
    var updateListingPromise = listingService.updateListing(updateData);
    updateListingPromise.then(function(result){
        res.json(result);
    }).catch(function(err){
        console.log("err: "+err);
    });
});

app.post('/listing', (req, res) => {
   var createListingPromise = listingService.createListing(req.body);
   createListingPromise.then(function(result){
       res.json(result);
   }).catch(function(err){
       console.log("err: "+err);
   });
});
app.listen(PORT, HOST);
