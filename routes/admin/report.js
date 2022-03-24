const express = require("express");
const router = express.Router();
const User = require("../../models/user")
const Question = require("../../models/question");
const Answer = require("../../models/answer");
const ReportedQuestion = require("../../models/reportedQuestions");
const ReportedAnswer = require("../../models/reportedAnswers");
const catchAsync = require("../../utils/catchAsync");
const ExpressError = require("../../utils/ExpressError");

//Importing Admin Report Controller
const adminReportController = require("../../controllers/admin/report");

//Get Route to Display All Reported Questions
router.get("/report",catchAsync(adminReportController.adminGetReportedQuestions));

//Get Route to Display All Reported Answers
router.get("/report/answers",catchAsync(adminReportController.adminGetReportedAnswers));

//Post Route to Add a Question to Reported Question
router.post("/report/question/:questionId",catchAsync(adminReportController.adminAddReportedQuestion));

//Post Route to Add an Answer to Reported Answers
router.post("/report/question/:questionId/answer/:answerId",catchAsync(adminReportController.addReportedAnswer));

//Delete Route to Delete a Question From Database
router.delete("/report/question/:questionId",catchAsync(adminReportController.deleteReportedQuestion));

module.exports = router;
