const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Question = require("../models/question");
const session = require("express-session");
const Answers = require("../models/answer");
//TODO Adding a section of tags which will allow the user to add tags 

router.get("/user/:id/question", async (req, res) => {
    const { id } = req.params;
    const userSession = req.session;
    const user = await User.findById(id);
    res.render("question", { user,userSession });
})

router.post("/user/:id/question", async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id);
    const { questionTitle, questionDescription } = req.body;

    const question = new Question({
        questionTitle,
        questionDescription
    })

    user.questions.push(question);
    question.user = user;

    await question.save();
    await user.save();

    res.redirect(`/`);

})

router.get("/questions", async (req, res) => {
    const questions = await Question.find().populate("answers");
    res.json(questions);
})



router.get("/user/:userId/question/:questionId", async (req, res) => {
    const userSession = req.session;
    const { userId, questionId } = req.params;
    const post = await User.findById(userId).populate("questions").then((user) => {
        for (const question of user.questions) {
            if (question._id == questionId) {
                return question.populate("answers");
            } else {
                return null;
            }
        }
    })
    res.json(post);
})

router.get("/question/:questionId",async (req,res) => {
    const userSession = req.session;
    const {questionId} = req.params;
    const question =await Question.findById(questionId).populate("user").populate({path:"answers",populate:{path:"user"}});
    res.render("fullQuestion",{question,userSession});

})

//*Update Route of Question
router.get("/question/:questionId/edit",async (req,res) => {
    const userSession = req.session;
    const {questionId} = req.params;
    const question =await Question.findById(questionId).populate("user").populate({path:"answers",populate:{path:"user"}});
    res.render("editQuestion",{question,userSession});
})

router.put("/question/:questionId/edit",async (req,res) => {
    const userSession = req.session;
    const {questionId} = req.params;
    const question = await Question.findByIdAndUpdate(questionId,{...req.body});
    res.redirect(`/question/${questionId}`);
})

//*Delete Route of Question
router.delete("/question/:questionId",async(req,res) => {
    const userSession = req.session;
    const {userid} = userSession;
    const {questionId} = req.params;
    const question = await Question.findById(questionId).populate("answers");

    await Question.findByIdAndDelete(questionId);

    //Delete Single Question From the User Schema By Using Pull and Questionid
    await User.findByIdAndUpdate(userid,{$pull:{questions:questionId}}); 
   

    //search For _id of the Answer and remove all the answers of question which has id in question.answers Database
    //*Its like _id is the searching parameter and $in will find the id in question.answers and if a _id is found in question.answers then it is removed
    await Answers.remove({_id:{
        $in: question.answers
    }}) 
    

    //Delete Answers in User.answers array
    //Pull the answers from User which id == question.answers.id
    const deletedAnswers = await User.findByIdAndUpdate(userid, {$pull : {answers: {$in:question.answers } }});
    res.redirect("/");
})


module.exports = router;