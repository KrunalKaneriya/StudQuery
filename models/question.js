const mongoose = require("mongoose");
const {stripHtml} = require("string-strip-html");
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
    comments:[{
        type:Schema.Types.ObjectId,
        ref:"Comments"
    }],
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
    }],
    images:[{
        url:String,
        filename:String
    }],
    isClosed:{
        type:Boolean,
        default:false
    }
},{timestamps:true})

//Before saving the questionDescription strip the html tags and save the questionDescription in snippet
QuestionSchema.pre("save",function(next) {
    if(this.questionDescription) {
        this.snippet = stripHtml(this.questionDescription.substring(0,430)).result.concat("...");
    }
    next();
})

module.exports = mongoose.model("Question",QuestionSchema);