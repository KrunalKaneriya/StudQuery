const User = require('../../models/user');
const Question = require('../../models/question');
const Answer = require('../../models/answer');
const ReportedAnswers = require('../../models/reportedAnswers');
const AnswerComment = require("../../models/answerComment");

module.exports.getAdminAnswers = async (req, res) => {
	const userSession = req.session;

	if (!userSession.isLoggedIn) {
		req.flash('error', 'You need to login first');
		res.redirect('/login');
	}

	const answers = await Answer.find().populate('user');
	res.render('admin/answer', { userSession, answers });
};

module.exports.deleteAnswer = async (req, res) => {
	const userSession = req.session;
	const { isLoggedIn } = userSession;
	const { answerId } = req.params;

	if (isLoggedIn) {
		const answer = await Answer.findById(answerId).populate('user').populate('question');

		//Firstly remove the answer
		await Answer.findByIdAndDelete(answerId);

		//Pull or delete the answer from the users
		await User.findByIdAndUpdate(answer.user._id, {
			$pull: { answers: answerId }
		});

		//Pull or delete the answer from the questions
		await Question.findByIdAndUpdate(answer.question._id, {
			$pull: { answers: answerId }
		});

		//Remove the AnswerComments From AnswerComments Database
		await AnswerComment.deleteMany({
			_id:{
				$in:answer.answerComments
			}
		})

		//Now find that the answer has ReportedAnswer or not.
		//If the answer is reported then remove the answer from the reportedAnswers also
		const isAnswerReported = await ReportedAnswers.exists({ reportedAnswer: answerId });
		if (isAnswerReported) {
			await ReportedAnswers.findOneAndDelete({ reportedAnswer: answerId });
		}

		req.flash('success', 'Deleted the answer Successfully');
		res.redirect('back');
	} else {
		req.flash('error', 'You need to login first to delete answer');
		res.redirect('/login');
	}
};
