const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const QuestionSchema = new Schema({
    questionTitle:{
        type:String,
        default:"Give Question A Title",
        required:true
    },
    questionDescription:{
        required:true,
        type:String,
        default:"No Question Specified"
    },
    upVotes:Number,
    downVotes:Number,
    user:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    answers:[{
        type:Schema.Types.ObjectId,
        ref:"Answer"
    }]
},{timestamps:true})

module.exports = mongoose.model("Question",QuestionSchema);