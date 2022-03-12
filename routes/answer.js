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


/************************************************
 * ROUTE WHICH WILL ADD ANSWER TO A QUESTION. *
 ************************************************/
router.post("/question/:questionId/answer",upload.array("answerImages"),catchAsync(answerController.createAnswer));

/*************************************************
 * ROUTE WHICH WILL REDIRECT TO ANSWER EDIT PAGE *
 *************************************************/
router.get("/question/:questionId/answer/:answerid/edit",catchAsync(answerController.renderEditAnswerForm) );

router.put("/question/:questionId/answer/:answerId",upload.array("uploadImages"),catchAsync(answerController.editAnswer) );

router.get("/question/:questionId/answer/:answerId/voteinc",answerController.answerVoteInc );

router.get("/question/:questionId/answer/:answerId/votedec",answerController.answerVoteDec);

router.post("/question/:questionId/answer/:answerId/report",catchAsync(answerController.reportAnswer));

router.delete("/question/:questionId/answer/:answerId",catchAsync(answerController.deleteAnswer) );

module.exports = router;
