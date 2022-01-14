const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Question = require("../models/question");
const session = require("express-session");

router.get("/user/:id/addQuestion",async (req,res) => {
    const {id} = req.params;
    const user = await User.findById(id);
    res.render("question",{user});
})

router.post("/user/:id/addQuestion",async (req,res) => {
    const {id} = req.params;
    const user = await User.findById(id);
    const {questionTitle,questionDescription} = req.body;

    const question = new Question({
        questionTitle,
        questionDescription
    })

    user.questions.push(question);
    question.user = user;

    await question.save();
    await user.save();

    res.redirect(`/user/${user._id}`);

})

module.exports = router;