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