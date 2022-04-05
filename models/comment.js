const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    commentDescription:String,
    user:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    question:{
        type:Schema.Types.ObjectId,
        ref:"Question"
    }
},{timestamps:true});

module.exports = mongoose.model("Comments",commentSchema);