const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AnswerSchema = new Schema({
    answerDescription:{
        required:true,
        type:String,
        default:"No Answer Given"
    },
    upVotes:Number,
    downvotes:Number,
    user:{
        type:Schema.Types.ObjectId,
        ref:'User'
    }
},{timestamps:true})

module.exports = mongoose.model('Answer',AnswerSchema);