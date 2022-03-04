const express = require("express");
const router = express.Router();
const User = require("../../models/user")
const Question = require("../../models/question");
const Answer = require("../../models/answer");
const ReportedQuestion = require("../../models/reportedQuestions");
const catchAsync = require("../../utils/catchAsync");
const ExpressError = require("../../utils/ExpressError");

router.get("/report",async (req,res) => {
    const userSession = req.session;
    const reportedQuestion = await ReportedQuestion.find();
    res.json({reportedQuestion});
})

router.post("/report/addQuestion/:questionId",async(req,res) => {
    const userSession = req.session;
    const {questionId} = req.params;

    const question = await Question.findByIdAndUpdate(questionId).populate("user").populate("answers");
    const reportedQuestion = new ReportedQuestion({
        reportedQuestion:question
    });
    await reportedQuestion.save();
})