const User = require("../../models/user");
const Question = require("../../models/question");
const Answer = require("../../models/answer");
const ReportedQuestion = require("../../models/reportedQuestions");
const ReportedAnswers = require("../../models/reportedAnswers");
const ExpressError = require("../../utils/ExpressError");

module.exports.sendAdminLogInInfo = async (req, res) => {
    res.redirect("/admin");
};

module.exports.adminLogout = (req, res) => {
    if (req.session) {
        req.session.destroy(() => {
            res.redirect("/login");
        })
    }
};

module.exports.renderAdminHomePage = async (req, res) => {
    const userSession = req.session;
    const { isLoggedIn, userid } = req.session;
    const questionCount = await Question.find().countDocuments();
    const answerCount = await Answer.find().countDocuments();
    const userCount = await User.find().countDocuments();
    const reportedQuestionsCount = await ReportedQuestion.find().countDocuments();
    const reportedAnswersCount = await ReportedAnswers.find().countDocuments()
    if (isLoggedIn) {
        res.render("admin/homepage", { userSession, questionCount, answerCount, userCount, reportedQuestionsCount, reportedAnswersCount });
    }
    else {
        req.flash("error","You need to login");
        res.redirect("/login");
    }
};