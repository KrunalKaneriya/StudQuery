const express = require("express");
const router = express.Router();
const User = require("../../models/user")
const Question = require("../../models/question");
const Answer = require("../../models/answer");
const catchAsync = require("../../utils/catchAsync");
const ExpressError = require("../../utils/ExpressError");

module.exports.renderAdminSearchForm = (req,res) => {
     const userSession = req.session;
 
     // if(!userSession.isLoggedIn) {
     //     throw new ExpressError(401,"User is required to login..");
     // }
 
     res.render("admin/search",{userSession});
};

module.exports.searchAdminData = async(req,res) => {
     const userSession = req.session;
 
     const {searchData,users,questions,answers} = req.query; //Take the search from the user
 
 
     //Search if the user searching word is found in user questions and in answers and pass to the search file
         const foundedUsers = await User.find({username: new RegExp(searchData, "i") }); 
         const foundedQuestions = await Question.find({questionTitle: new RegExp(searchData, "i")}).populate("user");
         const foundedAnswers = await Answer.find({answerDescription: new RegExp(searchData, "i")}).populate("user");
 
     res.render("admin/search",{userSession,foundedUsers,foundedQuestions,foundedAnswers});
 };