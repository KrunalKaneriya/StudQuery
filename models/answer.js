const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AnswerSchema = new Schema({
    answerDescription:{
        required:true,
        type:String,
        default:"No Answer Given"
    },
    votes:{
        default:0,
        type:Number
    },
    upVotes:[{
        type:Schema.Types.ObjectId,
        ref:"User"
    }],
    downVotes:[{
        type:Schema.Types.ObjectId,
        ref:"User"
    }],
    images:[{
        url:String,
        filename:String
    }],
    question:{
        type:Schema.Types.ObjectId,
        ref:"Question"
    },
    user:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})

module.exports = mongoose.model("Answer",AnswerSchema);