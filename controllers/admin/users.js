const express = require("express");
const router = express.Router();
const User = require("../../models/user")
const Question = require("../../models/question");
const Answer = require("../../models/answer");
const catchAsync = require("../../utils/catchAsync");
const ReportedQuestions = require("../../models/reportedQuestions");
const ReportedAnswers = require("../../models/reportedAnswers");

module.exports.renderAdminUsersPage = async (req,res) => {
     const userSession = req.session;
     const users = await User.find();
     res.render("admin/users",{userSession,users});
};

module.exports.adminDeleteUser = async(req,res) => {
     const userSession = req.session;
     const {userid} = req.params;
 
     const {isLoggedIn} = userSession;
 
     if(isLoggedIn) {

        //Here we are getting the users questions and answers because we also need to delete the
        //reported Questions and Answers and there is a way to check that the questions._id == 
        //reportedQuestion and after that delete it.
        const questionsAndAnswers = await User.findById(userid).populate("questions").populate("answers");
 
         await User.findByIdAndDelete(userid);
 
         await Answer.deleteMany({
             user: userid
         })
 
         await Question.deleteMany({
             user: userid
         })
 
        await ReportedQuestions.deleteMany({
            reportedQuestion: { $in :questionsAndAnswers.questions }
        })

         await ReportedAnswers.deleteMany({
            reportedAnswer : { $in : questionsAndAnswers.answers }
         })
 
         res.redirect("/admin/users");
 
         // const reportedQuestions = await ReportedQuestions.find().populate({path:"reportedQuestion",populate : {path:"user"}});
         // const isReportedQuestionFound = reportedQuestions.some(ques => {
         //     if(ques.reportedQuestion)
         // })
     } else {
         req.flash("error","You need to login to delete user");
         res.redirect("/login");
     } 
};