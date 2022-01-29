const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Question = require("../models/question");
const session = require("express-session");
const Post = require("../models/postSchema");
const Answer = require("../models/answer");

router.post("/question/:questionId/answer",async (req,res) => {
    const {questionId} = req.params;
    const userSession = req.session;
    const {isLoggedIn,userid} = userSession;
    if(isLoggedIn) {

        const question = await Question.findById(questionId);

        const user =await User.findById(userid);

        const {answerDescription} = req.body;
        const answer = new Answer({
            answerDescription
        });

        answer.question = question;
        answer.user = user;
        question.answers.push(answer);
        user.answers.push(answer);

        answer.save();
        question.save();
        user.save();

        res.redirect(`/question/${questionId}`);

    } else {
        res.send("You are Not Logged In. Cannot Post Answer");
    } 

})

router.get("/question/:questionId/answer/:answerid", async (req,res) => {
    const {answerid} = req.params;
    const userSession = req.session;
    const answer = await Answer.findById(answerid).populate("question").populate("user");
    const question = answer.question;
    res.render("editAnswer",{answer,question,userSession});
}) 


router.put("/question/:questionId/answer/:answerId/edit",async (req,res) => {
    const {answerId} = req.params;
    const answer = await Answer.findById(answerId).populate("user","username").populate("question","questionTitle questionDescription");
    const question = answer.question;
    await Answer.findByIdAndUpdate(answerId,{...req.body});
    res.redirect(`/question/${answer.question._id}`);
    //TODO Remaining Put Route in Answer Js And to Update the Answer Updated Time When Updating Answer
})

router.delete("/question/:questionId/answer/:answerId",async (req,res) => {
    const userSession = req.session;
    const {userid} = userSession;
    const {answerId,questionId} = req.params;

    const answer =await Answer.findById(answerId).populate("question");

    await User.findByIdAndUpdate(userid,{ $pull:{answers:answerId} });
    await Question.findByIdAndUpdate(questionId,{ $pull:{answers:answerId} });
    const deletedAnswer = await Answer.findByIdAndDelete(answerId);

    res.redirect(`/question/${questionId}`);
})

module.exports = router;