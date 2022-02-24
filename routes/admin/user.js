const express = require("express");
const router = express.Router();
const User = require("../../models/user")
const Question = require("../../models/question");
const Answer = require("../../models/answer");
const catchAsync = require("../../utils/catchAsync");

router.get("/admin/users",catchAsync(async (req,res) => {
    const userSession = req.session;
    const users = await User.find();
    res.render("admin/users",{userSession,users});
}))




module.exports = router;