const express = require("express");
const router = express.Router();
const User = require("../../models/user")
const Question = require("../../models/question");
const Answer = require("../../models/answer");
const catchAsync = require("../../utils/catchAsync");
const ExpressError = require("../../utils/ExpressError");
const {stripHtml} = require("string-strip-html")

const answersController = require("../../controllers/admin/answers");

//Get Route to Display All Answers
router.get("/admin/answers",catchAsync(answersController.getAdminAnswers));

//Delete Route to Delete an Answer from Database
router.delete("/admin/answer/:answerId",catchAsync (answersController.deleteAnswer));

module.exports = router;