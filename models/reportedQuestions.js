const mongoose = require("mongoose");
const ReportedAnswers = require("./reportedAnswers");
const Schema = mongoose.Schema;

const ReportedQuestionSchema = new Schema({
    reportedQuestion:{
        type:Schema.Types.ObjectId,
        ref:"Question"
    }
},{timestamps:true});


module.exports = mongoose.model("ReportedQuestion",ReportedQuestionSchema);
