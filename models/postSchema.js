const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    user:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    question:{
        type:Schema.Types.ObjectId,
        ref:"Question"
    },
    answer:{
        type:Schema.Types.ObjectId,
        ref:"Answer"
    }
})

module.exports = mongoose.model("Post",PostSchema);

//This schema is used to display a single post
/*
    It contains a user and a question and their answers
    All are refernces to user question and answer
    When a user post a question first add that question in the question model
    After that add the question in this model and along with their user
    Now if anyone posts answer then add that first in answer model and
    after that add that answer in this model

*/