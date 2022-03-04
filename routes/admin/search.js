const express = require("express");
const router = express.Router();
const User = require("../../models/user")
const Question = require("../../models/question");
const Answer = require("../../models/answer");
const catchAsync = require("../../utils/catchAsync");
const ExpressError = require("../../utils/ExpressError");

const adminSearchController = require("../../controllers/admin/search");

router.get("/admin/search",catchAsync(adminSearchController.renderAdminSearchForm));

router.get("/admin/searchData",catchAsync(adminSearchController.searchAdminData))



module.exports = router;