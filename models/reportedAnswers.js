const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReportedAnswerSchema = new Schema({
    reportedAnswer:{
        type:Schema.Types.ObjectId,
        ref:"Answer"
    }
},{timestamps:true});

module.exports = mongoose.model("ReportedAnswer",ReportedAnswerSchema);