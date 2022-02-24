const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AdminSchema = new Schema({
    username:{
        type:String,
        required:[true,'Username is Required'],
        default:"admin"
    },
    userHash:{
        type:String,
        required:['true','Userhash is Required']
    }
    

},{timestamps:true});

module.exports = mongoose.model("Admin",AdminSchema);