const cloudinary = require("cloudinary").v2;
const {CloudinaryStorage} = require("multer-storage-cloudinary");

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary,
    params:{
        folder:"StudQuery/Users",
        allowedFormats:["jpeg","png",'jpg'],
        width:300,
        height:300,
        gravity:"face",
        crop:"thumb",
        zoom:"0.75",
        radius:"max"
    }
});
module.exports = {cloudinary,storage};