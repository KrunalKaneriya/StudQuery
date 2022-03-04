const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Question = require("../models/question");
const Answers = require("../models/answer");
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const {stripHtml} = require("string-strip-html");

/*******************
 * VALIDATION SCHEMA *
 *******************/
const { questionValidator } = require("../models/validationSchema");

/*********************
 * CONTROLLERS FILES *
 *********************/

const questionController = require("../controllers/user/questions");


router.get("/question/new", catchAsync(questionController.renderNewQuestionForm) );

router.post("/question/new", catchAsync(questionController.createQuestion) );

router.get("/question/search", catchAsync(questionController.searchQuestion) );

router.get("/question/:questionId", catchAsync(questionController.viewQuestion) );

//*Update Route of Question
router.get("/question/:questionId/edit", catchAsync(questionController.renderEditQuestionForm) );

router.put("/question/:questionId/edit", questionValidator, catchAsync(questionController.updateQuestion) );

//*Delete Route of Question
router.delete("/question/:questionId", catchAsync(questionController.deleteQuestion) );

router.put("/question/:questionId/vote/inc", catchAsync(questionController.questionVoteInc));

//*Firstly we are going to check that the question id is founded in downVotes.
//*If Founded pull the userid from the downVotes and increase the vote count by 1.
//*Otherwise we will push the userid in the downVotes and decrease the vote count by 1.

router.put("/question/:questionId/vote/dec", catchAsync(questionController.questionVoteDec));

// function checkLogin (req,res,next) {
//     const userSession = req.session;
//     if((!userSession.isLoggedIn) || (!userSession.userid)) {
//         res.send("You Are not logged in. Login First");
//     } else {
//         next();
//     }
// }

module.exports = router;
