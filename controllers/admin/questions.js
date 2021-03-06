const User = require("../../models/user")
const Question = require("../../models/question");
const Answers = require("../../models/answer");
const ReportedQuestion = require("../../models/reportedQuestions");
const ReportedAnswer = require("../../models/reportedAnswers");

module.exports.getAdminQuestions = async (req, res) => {
    const userSession = req.session;
    const questions = await Question.find().populate("user");
    res.render("admin/questions", { userSession, questions });
};

module.exports.getAdminSingleQuestion = async (req, res) => {
    const userSession = req.session;
    const { questionId } = req.params;
    const question = await Question.findById(questionId)
    .populate("user")
    .populate({
         path: "answers", 
         populate: { path: "user" }
     }).
     populate({
         path:"comments",
         populate:{path:"user"}
     }).
     populate({
         path:"answers",
         populate:{
             path:"answerComments",
             populate:{
                 path:"user"
             }
         }
     })

     const answers = question.answers;
	 const comments = question.comments;

    res.render("admin/fullQuestion", { userSession, question,answers,comments });
};

module.exports.deleteAdminSingleQuestion = async (req, res) => {
    const userSession = req.session;
    const { isLoggedIn } = userSession;
    const { questionId } = req.params;

    if (isLoggedIn) {
        const question = await Question.findById(questionId).populate("answers").populate("user");
        //Remove the Question from database
        await Question.findByIdAndDelete(questionId);

        const reportedAnswers = await ReportedAnswer.deleteMany({reportedAnswer : { $in : [question.answers] }});

        // //Delete Single Question From the User Schema By Using Pull and Questionid
        await User.findByIdAndUpdate(question.user._id, { $pull: { questions: questionId } });

        await User.findByIdAndUpdate(question.user._id, { $pull: { savedQuestions : questionId }})

        //Pull the answers from User which id == question.answers.id
        await User.findByIdAndUpdate(question.user._id, { $pull: { answers: { $in: question.answers } } });


        //search For _id of the Answer and remove all the answers of question which has id in question.answers Database
        //*Its like _id is the searching parameter and $in will find the id in question.answers and if a _id is found in question.answers then it is removed
        //Delete Answers in User.answers array
        await Answers.deleteMany({
            _id: {
                $in: question.answers
            }
        });

      

        //Finding if the question is reported then delete from ReportedQuestions database also
        const isReportedQuestionFound = await ReportedQuestion.exists({ reportedQuestion: questionId });
        if (isReportedQuestionFound) {
            await ReportedQuestion.findOneAndDelete({ reportedQuestion: questionId });
        }
       

        req.flash("success", "Deleted the question successfully.");
        res.redirect("back");
    } else {
        req.flash("error", "You need to login first to delete question");
        res.redirect("/login");
    }
};