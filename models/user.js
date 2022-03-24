const mongoose = require("mongoose");
const Question = require("../models/question");
const Answer = require("../models/answer");
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
    lastLoggedIn:{
        type:Date
    },
    followedUsers:[{
        type:Schema.Types.ObjectId,
        ref:"User"
    }]
},{timestamps:true});


module.exports = mongoose.model("User",UserSchema);