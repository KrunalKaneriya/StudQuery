const express = require("express");
const router = express.Router();
const User = require("../models/user");
const session = require("express-session");
const crypt = require("bcrypt");



router.get("/",async (req,res) => {

    const {username,userid,email} = req.session;


    const users = await User.find({});

    res.render("home",{users,username,userid,email});
})

module.exports = router;