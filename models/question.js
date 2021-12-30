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
    questionCreationDate:Date,
    questionUpdatedDate:Date,
    upVotes:Number,
    downVotes:Number,
    user:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
})

module.exports = mongoose.model("Question",QuestionSchema);