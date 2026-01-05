const express =require("express");
const router =express.Router();
const wrapAsync = require('../utils/wrapAsync');
const Listing = require('../models/listing');
const  {isLoggedIn,isOwner,validateListing} = require("../middleware.js");
const ListingController =require("../controllers/listings.js");
const multer =require('multer');
const {storage}=require("../cloudConfig.js")
const upload = multer({storage});

//index route //create route
router.route("/")
.get(wrapAsync(ListingController.index))
.post(validateListing,isLoggedIn, upload.single('listing[image][url]'),wrapAsync(ListingController.createListing));


//new Route
router.get('/new',isLoggedIn,ListingController.renderNewForm);

//show route //up-date route //delete route
router.route('/:id')
.get(wrapAsync(ListingController.showListing))
.put(isLoggedIn,isOwner,upload.single("listing[image]"),validateListing, wrapAsync(ListingController.updateListing))
.delete( isLoggedIn,isOwner,wrapAsync(ListingController.destroyListing)); 




//edit the route
router.get('/:id/edit',isLoggedIn,isOwner, wrapAsync(ListingController.renderEditForm));


module.exports = router;