const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const User = require("../../models/user");
const Question = require("../../models/question");
const Answer = require("../../models/answer");
const catchAsync = require("../../utils/catchAsync");
const router = express.Router();

module.exports.exploreTopics = async (req,res) => {
     const userSession = req.session;
     req.session.redirectUrl = req.originalUrl;
     let tagsArray = [];
     const tags = await Question.find({},'tags')
     tags.forEach(el => {
         tagsArray.push(...el.tags);
     });
 
     let uniqueTags = tagsArray.filter((el,index) => {
         return tagsArray.indexOf(el) === index;
     }); 
     res.render("explore",{userSession,uniqueTags});
};

module.exports.viewParticularTopic = async (req,res) => {
     const userSession = req.session;
     req.session.redirectUrl = req.originalUrl;
     const {tag} = req.params;
     const tagResult = await Question.find({tags: { $in : [tag]}}).populate("user").populate("answers");
     res.render("tags",{tag,tagResult,userSession});  
 };

