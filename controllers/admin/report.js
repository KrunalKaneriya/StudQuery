const User = require('../../models/user');
const Question = require('../../models/question');
const Answer = require('../../models/answer');
const ReportedQuestion = require('../../models/reportedQuestions');
const ReportedAnswer = require('../../models/reportedAnswers');

module.exports.adminGetReportedQuestions = async (req, res) => {
	const userSession = req.session;
	const reportedQuestions = await ReportedQuestion.find().populate({
		path: 'reportedQuestion',
		populate: { path: 'user answers' }
	})

	res.render('admin/reportedQuestions', { userSession, reportedQuestions });
};

module.exports.adminGetReportedAnswers = async (req, res) => {
	const userSession = req.session;
	const reportedAnswers = await ReportedAnswer.find().populate({
		path: 'reportedAnswer',
		populate: { path: 'user' }
	});
	res.render('admin/reportedAnswers', { userSession, reportedAnswers });
};

module.exports.adminAddReportedQuestion = async (req, res) => {
	const userSession = req.session;
	const { isLoggedIn } = userSession;

	const { questionId } = req.params;
	const {isFullQuestion} = req.query;
	if (!isLoggedIn) {
		req.flash('error', 'You need to login to report Question');
	} else {
		//Checking Question is Reported?
		const isQuestionReported = await ReportedQuestion.exists({
			reportedQuestion: questionId
		});
		//If Question is Reported then don't add it again and redirect.
		if (isQuestionReported) {
			req.flash('error', 'This Question is already reported to our Servers');
		} else {
			const question = await Question.findById(questionId).populate("user");
			const user = question.user;
			const ques = new ReportedQuestion({});
			ques.reportedQuestion = question;
			await ques.save();
			await user.save();
			req.flash('success', 'This question is reported to our Servers!');

		}
	}
	res.redirect('back');

	
	
};

module.exports.addReportedAnswer = async (req, res) => {
	const userSession = req.session;
	const { isLoggedIn } = userSession;
	const { answerId, questionId } = req.params;

	if (!isLoggedIn) {
		req.flash('error', 'You need to login to report Answer');
	} else {
		//Checking is Answer Reported?
		const isAnswerReported = await ReportedAnswer.exists({
			reportedAnswer: answerId
		});
		//If Answer is Reported then don't add it again and redirect.
		if (isAnswerReported) {
			req.flash('error', 'This answer is already reported to our Servers!');
		} else {
			const answer = await Answer.findById(answerId).populate("user");
			const answerUser = answer.user;
			const ans = new ReportedAnswer({});
			ans.reportedAnswer = answer;
			await ans.save();
			await answerUser.save();
			req.flash('success', 'This answer is reported to our Servers!');
		}
	}

	res.redirect('back');
};

module.exports.deleteReportedQuestion = async (req, res) => {
	const userSession = req.session;
	const { questionId } = req.params;
	const { isLoggedIn } = userSession;

	//Find the Reported Question And Populate User Details
	const question = await ReportedQuestion.findById(questionId).populate({
		path: 'reportedQuestion',
		populate: { path: 'user answers' }
	});

	//Remove the Reported Question
	await ReportedQuestion.findByIdAndDelete(questionId);

	 //Remove The Original Question
	 await Question.findByIdAndDelete(question.reportedQuestion._id);

	//Now remove the Question from the userid
	await User.findByIdAndUpdate(question.reportedQuestion.user._id, {
		$pull: { questions: question.reportedQuestion._id }
	});

	//Now remove the answers from the userid
	await User.findByIdAndUpdate(question.reportedQuestion.user._id, {
		$pull: { answers: { $in: question.reportedQuestion.answers } }
	});

	//Now we will remove all the answers of the particular question
	await Answer.deleteMany({
		_id: {
			$in: question.reportedQuestion.answers
		}
	});

	await ReportedAnswer.deleteMany({
		reportedAnswer : {
			$in : question.reportedQuestion.answers
		}
	})

	req.flash('success', 'The Question is deleted successfully..');
	res.redirect('/report');
};
