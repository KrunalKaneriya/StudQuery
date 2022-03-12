const crypt = require("bcrypt");
const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Question = require("../models/question");
const session = require("express-session");
const Answer = require("../models/answer");
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const answer = require("../models/answer");
const userController = require("../controllers/user/users");

router.get("/user/notLoggedIn",catchAsync(userController.renderUserError));

router.get("/user/getNotifications",catchAsync(userController.getNotifications));

router.get("/user/:id",catchAsync(userController.renderUserProfilePage));

router.put("/user/:id",catchAsync(userController.editUser));

router.delete("/user/:id",catchAsync(userController.deleteUser));

router.get("/user/:id/question/savedQuestions",catchAsync(userController.getSavedQuestions))

router.post("/user/:id/question/:questionId/savedQuestions",catchAsync(userController.saveQuestion));

router.get("/user/:userid/question/createdQuestions",catchAsync(userController.createdQuestions));



module.exports = router;
