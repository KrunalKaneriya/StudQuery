const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    answerCommentDescription:String,
    user:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    answer:{
        type:Schema.Types.ObjectId,
        ref:"Answer"
    }
},{timestamps:true});

module.exports = mongoose.model("AnswerComments",commentSchema);