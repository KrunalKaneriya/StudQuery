const express = require("express");
const router = express.Router();
const User = require("../../models/user")
const Question = require("../../models/question");
const Answer = require("../../models/answer");
const catchAsync = require("../../utils/catchAsync");

router.get("/admin/questions", catchAsync(async (req, res) => {
    const userSession = req.session;
    const questions = await Question.find().populate("user");
    res.render("admin/questions", { userSession, questions });
}))

router.get("/admin/question/:questionId",catchAsync(async (req, res) => {
    const userSession = req.session;
    const { questionId } = req.params;
    const question = await Question.findById(questionId).populate({ path: "answers", populate: { path: "user" } }).populate("user");
    res.render("admin/fullQuestion", { userSession, question });
}))

module.exports = router;