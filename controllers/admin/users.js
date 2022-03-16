const express = require("express");
const router = express.Router();
const User = require("../../models/user")
const Question = require("../../models/question");
const Answer = require("../../models/answer");
const catchAsync = require("../../utils/catchAsync");
const ReportedQuestions = require("../../models/reportedQuestions");

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
 
         await User.findByIdAndDelete(userid);
 
         await Answer.deleteMany({
             user: userid
         })
 
         await Question.deleteMany({
             user: userid
         })
 
         await ReportedQuestions.deleteMany({
             "reportedQuestion.reportedQuestion.user._id" : userid
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