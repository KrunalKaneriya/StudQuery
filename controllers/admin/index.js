const User = require("../../models/user");
const Question = require("../../models/question");
const Answer = require("../../models/answer");
const ReportedQuestion = require("../../models/reportedQuestions");
const ReportedAnswers = require("../../models/reportedAnswers");
module.exports.renderAdminLoginPage = async (req,res) => {
    res.render("admin/adminLogin");
}

module.exports.sendAdminLogInInfo = async (req, res) => {
    res.redirect("/admin");
};


module.exports.renderAdminHomePage = async (req, res) => {
    const userSession = req.session;
    const { isLoggedIn} = req.session;
    const questionCount = await Question.find().countDocuments();
    const answerCount = await Answer.find().countDocuments();
    const userCount = await User.find().countDocuments();
    const reportedQuestionsCount = await ReportedQuestion.find().countDocuments();
    const reportedAnswersCount = await ReportedAnswers.find().countDocuments()
    if (isLoggedIn) {
        res.render("admin/homepage", { userSession, questionCount, answerCount, userCount, reportedQuestionsCount, reportedAnswersCount });
    }
    else {
        res.redirect("/admin/login");
    }
};

module.exports.adminLogout = (req, res) => {
    if (req.session.isLoggedIn) {
		req.session.destroy(() => {
			res.redirect("/login");
		});
	}
};
