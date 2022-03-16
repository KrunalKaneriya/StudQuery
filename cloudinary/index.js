const cloudinary = require("cloudinary").v2;//This package is used to upload the images to cloudinary
const {CloudinaryStorage} = require("multer-storage-cloudinary"); //This is required to parse the images and upload it.


//We need to use config function to pass the credentials required when we upload an image
cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary,
    params:{
        folder:"StudQuery",
        allowedFormats:["png",'jpg'],
        width:600,
        height:300,
        quality:50
    }
});

module.exports = {cloudinary,storage};