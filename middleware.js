const Listing = require("./models/listing");
const Review= require("./models/review");

const ExpressError = require('./utils/ExpressError');
const {listingSchema,reviewSchema} = require('./schema.js');

module.exports.isLoggedIn =(req,res,next)=>{
     if(!req.isAuthenticated()){
        req.session.redirectUrl=req.originalUrl;
    req.flash("error","you must login first to create listing");
    return res.redirect("/login");
  }
  next();
}


module.exports.saveRedirectUrl =(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;
    }
    next();
}

module.exports.isOwner =async(req,res,next)=>{
    let{id}= req.params;
    let listing =await Listing.findById(id);
    if (!listing.owner.equals(res.locals.currUser._id)){
        req.flash("error","you do not have permisiion to edit");
        return res.redirect(`/listings/${id}`);
    }
next();

};

module.exports.validateListing = (req, res, next) => {
  let result = listingSchema.validate(req.body);
  if(result.error){
    throw new ExpressError(result.error.details.map(detail => detail.message).join(', '), 400);
  }
  else{
    next();
  }
};

module.exports.validateReview = (req, res, next) => {
  let result = reviewSchema.validate(req.body);
  if(result.error){
    throw new ExpressError(400,result.error.details.map(detail => detail.message).join(', '));
  }
  else{
    next();
  }
};

module.exports.isReviewAuther =async(req,res,next)=>{
    let{id,reviewId}= req.params;
    let review =await Review.findById(reviewId);
    if (!review.auther.equals(res.locals.currUser._id)){
        req.flash("error","you are not the auther of this review");
        return res.redirect(`/listings/${id}`);
    }
next();

};