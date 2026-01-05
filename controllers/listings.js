const listing = require('../models/listing');
const Listing = require('../models/listing');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken= process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index =async(req, res) => {
  const alllistings = await Listing.find({});
res.render('listings/index', { alllistings });
   
}

module.exports.renderNewForm=(req, res) => {
  res.render('listings/new');
};

module.exports.showListing= async(req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
  .populate({
    path:"reviews",
populate:{
  path:"auther",
},
  })
  .populate("owner");
  if(!listing){
      req.flash("error","Listing you requested does not exist");
      return res.redirect("/listings");
  }
  res.render('listings/show', { listing });
};


module.exports.createListing=async(req, res) => {
let response =await geocodingClient.forwardGeocode({
  query: req.body.listing.location,
  limit: 1
})
  .send()
 
  let url =req.file.path;
  let filename =req.file.filename;
  if(!req.body.listing) throw new ExpressError('Invalid Listing Data', 400);
  // let result = listingSchema.validate(req.body);
  // if(result.error){
  //   throw new ExpressError(result.error, 400);
  // }
  const newlisting = new Listing(req.body.listing);
  newlisting.owner=req.user._id; 
  newlisting.image ={url,filename};

  newlisting.geometry = response.body.features[0].geometry;

  let savedListing= await newlisting.save();
  console.log(savedListing);
  req.flash("success","new lsiting created succesfully");
  res.redirect("/listings");

};

module.exports.renderEditForm =async(req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
   if(!listing){
      req.flash("error","Listing you trying to edit does not exist");
      return res.redirect("/listings");
  }
  let originalImageUrl=listing.image.url;
 originalImageUrl= originalImageUrl.replace("/upload",'/upload/w_120,h_80,c_fill,q_auto,f_auto/');
  res.render('listings/edit', { listing ,originalImageUrl});
};


module.exports.updateListing =async(req, res) => {
    if(!req.body.listing) throw new ExpressError('Invalid Listing Data', 400);
  const { id } = req.params;
    delete req.body.listing.image;

  let listing =await Listing.findByIdAndUpdate(id, {...req.body.listing, new:true});

  if (req.body.listing.location) {
    const response = await geocodingClient
      .forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
      })
      .send();

    if (response.body.features.length) {
      listing.geometry = response.body.features[0].geometry;
    }
  }
if(req.file){
  let url =req.file.path;
  let filename =req.file.filename;
  listing.image={url,filename};
  await listing.save();
}
    req.flash("success"," listing updated");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing=async(req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
    req.flash("success"," listing  deleted");
  res.redirect('/listings');
};

