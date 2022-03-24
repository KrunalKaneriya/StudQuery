const express = require("express");
const router = express.Router();
const User = require("../../models/user")
const Question = require("../../models/question");
const Answer = require("../../models/answer");
const catchAsync = require("../../utils/catchAsync");
const Answers = require("../../models/answer");
const ReportedQuestion = require("../../models/reportedQuestions");
//Import Admin Question Controller
const questionsController = require("../../controllers/admin/questions");

//Get Route to Display All Questions 
router.get("/admin/questions", catchAsync(questionsController.getAdminQuestions));

//Get Route to Display a Question
router.get("/admin/question/:questionId",catchAsync(questionsController.getAdminSingleQuestion));

//Delete Route to Delete a Question From Database
router.delete("/admin/question/:questionId", catchAsync(questionsController.deleteAdminSingleQuestion)
);

module.exports = router;