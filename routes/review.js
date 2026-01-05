const express =require("express");
const router =express.Router({mergeParams:true});

const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ExpressError');
const Review = require('../models/review');
const Listing = require('../models/listing');
const {validateReview, isLoggedIn,isReviewAuther} =require("../middleware.js")
const reviewcontroller =require("../controllers/reviews.js");



// post reviews route 
router.post('/',isLoggedIn,validateReview, wrapAsync(reviewcontroller.createReview));


//Delete review route
router.delete("/:reviewId",isLoggedIn,isReviewAuther,wrapAsync(reviewcontroller.destroyReview));


module.exports= router;
