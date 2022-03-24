const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const User = require("../models/user");
const Question = require("../models/question");
const Answer = require("../models/answer");
const catchAsync = require("../utils/catchAsync");
const exploreController = require("../controllers/user/explore");
const router = express.Router();


//Get Route to Render Explore Tags Page
router.get("/explore",catchAsync(exploreController.exploreTopics));

//Get Route to Render a Specific Tag
router.get("/explore/:tag",catchAsync(exploreController.viewParticularTopic));

module.exports = router;