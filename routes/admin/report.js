const express = require("express");
const router = express.Router();
const User = require("../../models/user")
const Question = require("../../models/question");
const Answer = require("../../models/answer");
const ReportedQuestion = require("../../models/reportedQuestions");
const ReportedAnswer = require("../../models/reportedAnswers");
const catchAsync = require("../../utils/catchAsync");
const ExpressError = require("../../utils/ExpressError");

const adminReportController = require("../../controllers/admin/report");

router.get("/report",catchAsync(adminReportController.adminGetReportedQuestions));

router.get("/report/answers",catchAsync(adminReportController.adminGetReportedAnswers));

router.post("/report/question/:questionId",catchAsync(adminReportController.adminAddReportedQuestion));

router.post("/report/question/:questionId/answer/:answerId",catchAsync(adminReportController.addReportedAnswer));

router.delete("/report/question/:questionId",catchAsync(adminReportController.deleteReportedQuestion));

module.exports = router;
