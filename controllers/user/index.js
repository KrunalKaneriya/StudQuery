const crypt = require("bcrypt");
const express = require("express");
const router = express.Router();
const User = require("../../models/user");
const Question = require("../../models/question");
const session = require("express-session");
const Post = require("../../models/postSchema");
const Answer = require("../../models/answer");
const catchAsync = require("../../utils/catchAsync");
const ExpressError = require("../../utils/ExpressError");

module.exports.renderHomePage = async (req,res) => {
     const posts = await Question.find().populate("answers").populate("user");
     const newUsers = await User.find().sort({createdAt:'desc'}).limit(5);
     const userSession = req.session;
     req.session.redirectUrl = req.originalUrl;
     res.render("home",{posts,newUsers,userSession});
};

module.exports.filterQuestions = async (req,res) => {
     const {createdAt,votes} = req.query; //Get the filter options from the url 
     const userSession = req.session;
     const newUsers = await User.find().sort({createdAt:'desc'}).limit(5); //Find the last 5 users created and send it to home file
     
     //If the createdAt option was selected then find the questions and their answers and users according to the date
     //in which they were created
     if(createdAt) {
          const posts = await Question.find().populate("answers").populate("user").sort({createdAt:createdAt})
          res.render("home",{posts,newUsers,userSession});

     } else if(votes) {
          //if the votes option was selected then find the questions and their answers and users according to the votes
          //of the questions
          const posts = await Question.find().populate("answers").populate("user").sort({votes:votes});
          res.render("home",{posts,newUsers,userSession});
     }

}