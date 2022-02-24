const express = require("express");
const router = express.Router();
const User = require("../../models/user")
const Question = require("../../models/question");
const Answer = require("../../models/answer");
const catchAsync = require("../../utils/catchAsync");
const ExpressError = require("../../utils/ExpressError");

router.get("/admin/answers",catchAsync(async(req,res) => {
    const userSession = req.session;

    if(!userSession.isLoggedIn) {
        throw new ExpressError(401,'You need to Login first.');
    }

    const answers = await Answer.find().populate("user");
    res.render("admin/answer",{userSession,answers});
}))


module.exports = router;