const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Question = require("../models/question");
const Answer = require("../models/answer");
const catchAsync = require("../utils/catchAsync");
const answerController = require("../controllers/user/answers");

/************************************************
 * ROUTE WHICH WILL ADD ANSWER TO A QUESTION. *
 ************************************************/
router.post("/question/:questionId/answer",catchAsync(answerController.createAnswer));

/*************************************************
 * ROUTE WHICH WILL REDIRECT TO ANSWER EDIT PAGE *
 *************************************************/
router.get("/question/:questionId/answer/:answerid/edit",catchAsync(answerController.renderEditAnswerForm) );

router.put("/question/:questionId/answer/:answerId",catchAsync(answerController.editAnswer) );

router.put("/question/:questionId/answer/:answerId/voteinc",catchAsync(answerController.answerVoteInc) );

router.put("/question/:questionId/answer/:answerId/votedec",catchAsync(answerController.answerVoteDec));

router.post("/question/:questionId/answer/:answerId/report",catchAsync(answerController.reportAnswer));

router.delete("/question/:questionId/answer/:answerId",catchAsync(answerController.deleteAnswer) );

module.exports = router;
