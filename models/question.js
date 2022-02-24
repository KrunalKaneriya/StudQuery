const mongoose = require("mongoose");
const stripHTML = require("string-strip-html");
const Schema = mongoose.Schema;

const QuestionSchema = new Schema({
    questionTitle:{
        type:String,
        default:"Give Question A Title",
        required:true
    },
    snippet: {
        type:String
    },
    questionDescription:{
        required:true,
        type:String,
        default:"No Question Specified"
    },
    tags:{
        type:[String],
        default:"No Tags Given"
    },
    upVotes:[{
        type:Schema.Types.ObjectId,
        ref:"User"
    }],
    downVotes:[{
        type:Schema.Types.ObjectId,
        ref:"User"
    }],
    votes:{
        type:Number,
        default:0
    },
    user:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    answers:[{
        type:Schema.Types.ObjectId,
        ref:"Answer"
    }]
},{timestamps:true})

//Before saving the questionDescription strip the html tags and save the questionDescription in snippet
QuestionSchema.pre("save",function(next) {
    if(this.questionDescription) {
        this.snippet = stripHTML.stripHtml(this.questionDescription.substring(0,430)).result
    }
    next();
})

module.exports = mongoose.model("Question",QuestionSchema);