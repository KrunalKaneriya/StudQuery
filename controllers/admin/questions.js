const User = require("../../models/user")
const Question = require("../../models/question");
const Answers = require("../../models/answer");
const ReportedQuestion = require("../../models/reportedQuestions");

module.exports.getAdminQuestions = async (req, res) => {
    const userSession = req.session;
    const questions = await Question.find().populate("user");
    res.render("admin/questions", { userSession, questions });
};

module.exports.getAdminSingleQuestion = async (req, res) => {
    const userSession = req.session;
    const { questionId } = req.params;
    const question = await Question.findById(questionId).populate({ path: "answers", populate: { path: "user" } }).populate("user");
    res.render("admin/fullQuestion", { userSession, question });
};

module.exports.deleteAdminSingleQuestion = async (req, res) => {
    const userSession = req.session;
    const { isLoggedIn } = userSession;
    const { questionId } = req.params;

    if (isLoggedIn) {
        const question = await Question.findById(questionId).populate("answers").populate("user");
        //Remove the Question from database
        await Question.findByIdAndDelete(questionId);

        // //Delete Single Question From the User Schema By Using Pull and Questionid
        await User.findByIdAndUpdate(question.user._id, { $pull: { questions: questionId } });

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
        res.redirect("/admin/questions");
    } else {
        req.flash("error", "You need to login first to delete question");
        res.redirect("/login");
    }
};