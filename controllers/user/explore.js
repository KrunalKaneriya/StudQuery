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
     let tagsArray = []; //Initialize an empty tags array in which tags will be stored
     const tags = await Question.find({},'tags') //Find all the tags of different questions

     //Now for each tag push the tag into tagsArray array
     tags.forEach(el => {
         tagsArray.push(...el.tags);
     });
 
     //Now filter the tagsArray 
     let uniqueTags = tagsArray.filter((el,index) => { //Two parameters tag and index of tag will be passed
         return tagsArray.indexOf(el) === index; //Now only add the tag into uniqueTags whose index is same as the tag[index]
     }); 

     res.render("explore",{userSession,uniqueTags});
};

module.exports.viewParticularTopic = async (req,res) => {
     const userSession = req.session;
     req.session.redirectUrl = req.originalUrl;
     const {tag} = req.params; //Get the tag from the parameters of url

     //Find in the question where tags will be in tag parameter
     const tagResult = await Question.find({tags: { $in : [tag]}}).populate("user").populate("answers");
     
     res.render("tags",{tag,tagResult,userSession});  
 };

