const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Question = require("../models/question");
const Answer = require("../models/answer");
const catchAsync = require("../utils/catchAsync");
const answerController = require("../controllers/user/answers");
const multer = require("multer"); //Package Required to parse Images
const {storage,cloudinary} = require("../cloudinary/index");
const upload = multer({storage}); //This is the storage of the Images


//Post Route To Add Answer to Database along with images
router.post("/question/:questionId/answer",upload.array("answerImages"),catchAsync(answerController.createAnswer));

//Get Route to Render Edit Answer Page
router.get("/question/:questionId/answer/:answerid/edit",catchAsync(answerController.renderEditAnswerForm) );

//Put or Update Route to update the answer and save new updated answer in database along with images uploaded
router.put("/question/:questionId/answer/:answerId",upload.array("uploadImages"),catchAsync(answerController.editAnswer) );

//Get Route to increase answer vote
router.get("/question/:questionId/answer/:answerId/voteinc",answerController.answerVoteInc );

//Get Route to decrease answer vote
router.get("/question/:questionId/answer/:answerId/votedec",answerController.answerVoteDec);

//Post Route to send the answer to add answer to reported answers
router.post("/question/:questionId/answer/:answerId/report",catchAsync(answerController.reportAnswer));

//Delete Route to delete the answer from database
router.delete("/question/:questionId/answer/:answerId",catchAsync(answerController.deleteAnswer) );

//Post Route to add a comment in answer
router.post("/question/:questionId/answer/:answerId/addComment",catchAsync(answerController.addComment));

//Put Route to edit a comment in answer
router.put("/question/:questionId/answer/:answerId/comment/:commentId",catchAsync(answerController.editComment))

//Delete Route to delete a comment in answer
router.delete("/question/:questionId/answer/:answerId/comment/:commentId",catchAsync(answerController.deleteComment))
module.exports = router;
