const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Question = require("../models/question");
const Answers = require("../models/answer");
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const {stripHtml} = require("string-strip-html");
const multer = require("multer"); //Package Required to parse Images
const {storage,cloudinary} = require("../cloudinary/index");
const upload = multer({storage}); //This is the storage of the Images

//*Importing Question Controller File
const questionController = require("../controllers/user/questions");

//Get Route to Render Create New Question Form
router.get("/question/new", catchAsync(questionController.renderNewQuestionForm) );

//Post Route to Add the Created Question into Database along with images Being Uploaded
router.post("/question/new",upload.array("images"),catchAsync(questionController.createQuestion) );

//Get Route to Render Search Page
router.get("/question/search", catchAsync(questionController.searchQuestion) );

//Get Route to View a Question
router.get("/question/:questionId", catchAsync(questionController.viewQuestion) );

//Get Route to Close a Question For Accepting Answers
router.get("/question/:questionId/closeQuestion",catchAsync(questionController.closeQuestion));

//Get Route to Open a Question For Accepting Answers
router.get("/question/:questionId/openQuestion",catchAsync(questionController.openQuestion));

//Get Route to Render Edit Question Form
router.get("/question/:questionId/edit", catchAsync(questionController.renderEditQuestionForm) );

//Put or Update Route to update the Question and save it in Database along with Images Uploaded.
router.put("/question/:questionId/edit",upload.array("uploadImages"),catchAsync(questionController.updateQuestion) );

//Delete Route to Delete a Question
router.delete("/question/:questionId", catchAsync(questionController.deleteQuestion) );

//Put or Update Route to Increase Question Vote
router.put("/question/:questionId/vote/inc", catchAsync(questionController.questionVoteInc));

//Put or Update Route to Decrease Question Vote
router.put("/question/:questionId/vote/dec", catchAsync(questionController.questionVoteDec));

//Post Route to add a comment in question
router.post("/question/:questionId/addComment",catchAsync(questionController.addComment));

//Put route to edit a comment in question
router.put("/question/:questionId/comment/:commentId",catchAsync(questionController.editComment));

//Delete route to delete a comment in question
router.delete("/question/:questionId/comment/:commentId",catchAsync(questionController.deleteComment));
module.exports = router;
