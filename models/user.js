const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username:{
        type:String,
        required:true,
        default:"User Name is Not Given"
    },
    userHash:{
        type:String,
        required:[true,"Userhash is Required"]
    },
    password:{
        type:String
    },
    alias:String,
    email:{
        type:String,
        required:true,
        default:"Email Address Not Specified"
    },
    description:String,
    questions:[{
        type:Schema.Types.ObjectId,
        ref:"Question"
    }],
    answers:[{
        type:Schema.Types.ObjectId,
        ref:"Answer"
    }],
    savedQuestions:[{
        type:Schema.Types.ObjectId,
        ref:"Question"
    }],
    image:{
        url:String,
        filename:String
    },
    country:String,
    notifications:[{
        message:String,
        questionId:{
            type:Schema.Types.ObjectId,
            ref:"Question"
        }
    }],
    lastLoggedIn:{
        type:Date
    },
    
},{timestamps:true});



module.exports = mongoose.model("User",UserSchema);