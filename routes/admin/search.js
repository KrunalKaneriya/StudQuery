const express = require("express");
const router = express.Router();
const User = require("../../models/user")
const Question = require("../../models/question");
const Answer = require("../../models/answer");
const catchAsync = require("../../utils/catchAsync");
const ExpressError = require("../../utils/ExpressError");

//Importing Admin Search Controller
const adminSearchController = require("../../controllers/admin/search");

//Get Route to Render Admin Search Form
router.get("/admin/search",catchAsync(adminSearchController.renderAdminSearchForm));

//Get Route to Search the Data From Database and Display to Admin
router.get("/admin/searchData",catchAsync(adminSearchController.searchAdminData))



module.exports = router;