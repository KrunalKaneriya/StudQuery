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
     const {userid} = userSession;
     req.session.redirectUrl = req.originalUrl;
     res.render("home",{posts,newUsers,userSession});
};

module.exports.filterQuestions = async (req,res) => {
     const {createdAt,votes} = req.query;
     const userSession = req.session;
     const newUsers = await User.find().sort({createdAt:'desc'}).limit(5);
     if(createdAt) {
          const posts = await Question.find().populate("answers").populate("user").sort({createdAt:createdAt})
          res.render("home",{posts,newUsers,userSession});
     } else if(votes) {
          const posts = await Question.find().populate("answers").populate("user").sort({votes:votes});
          res.render("home",{posts,newUsers,userSession});
     }

}