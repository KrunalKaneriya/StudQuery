const express = require("express");
const router = express.Router();
const User = require("../../models/user")
const Question = require("../../models/question");
const Answer = require("../../models/answer");
const catchAsync = require("../../utils/catchAsync");
const ExpressError = require("../../utils/ExpressError");


router.get("/admin/search",catchAsync(async(req,res) => {
    const userSession = req.session;

    // if(!userSession.isLoggedIn) {
    //     throw new ExpressError(401,"User is required to login..");
    // }

    res.render("admin/search",{userSession});
}))

router.get("/admin/searchData",catchAsync(async(req,res) => {
    const userSession = req.session;

    const {searchData,users,questions,answers} = req.query;


        const foundedUsers = await User.find({username: new RegExp(searchData, "i") });
        const foundedQuestions = await Question.find({questionTitle: new RegExp(searchData, "i")});
        const foundedAnswers = await Answer.find({answerDescription: new RegExp(searchData, "i")});

    res.render("admin/search",{userSession,foundedUsers,foundedQuestions,foundedAnswers});
}))



module.exports = router;