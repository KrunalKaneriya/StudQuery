const express = require("express");
const router = express.Router();
const User = require("../../models/user")
const Question = require("../../models/question");
const Answer = require("../../models/answer");
const catchAsync = require("../../utils/catchAsync");
const ReportedQuestions = require("../../models/reportedQuestions");

//Importing Admin Users Controller
const adminUsersController = require("../../controllers/admin/users");

//Get Route to Display all Users
router.get("/admin/users",catchAsync(adminUsersController.renderAdminUsersPage));

//Delete Route to Delete an User
router.delete("/admin/users/:userid",catchAsync(adminUsersController.adminDeleteUser));

module.exports = router;