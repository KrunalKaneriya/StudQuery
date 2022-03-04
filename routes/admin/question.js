const express = require("express");
const router = express.Router();
const User = require("../../models/user")
const Question = require("../../models/question");
const Answer = require("../../models/answer");
const catchAsync = require("../../utils/catchAsync");
const Answers = require("../../models/answer");
const ReportedQuestion = require("../../models/reportedQuestions");

const questionsController = require("../../controllers/admin/questions");

router.get("/admin/questions", catchAsync(questionsController.getAdminQuestions));

router.get("/admin/question/:questionId",catchAsync(questionsController.getAdminSingleQuestion));

router.delete("/admin/question/:questionId", catchAsync(questionsController.deleteAdminSingleQuestion)
);

module.exports = router;