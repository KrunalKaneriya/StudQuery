const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    userName:{
        type:String,
        required:true,
        default:"User Name is Not Given"
    },
    alias:String,
    userEmail:{
        type:String,
        required:true,
        default:"Email Address Not Specified"
    },
    userAge:Number,
    description:String,
    userJoiningDate:{
        type:Date,
        required:true,
        default:"User Joining Date Not Given"
    },
    lastAccessTime:Date,
    totalQuestions:Number,
    totalAnswers:Number,
    studyingIn:String
})

module.exports = mongoose.model("User",UserSchema);