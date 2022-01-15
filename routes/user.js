const express = require("express");
const router = express.Router();
const User = require("../models/user");
const session = require("express-session");
const crypt = require("bcrypt");

router.get("/user/:id",async (req,res) => {
    const {id} = req.params;
    const user = await User.findById(id);
   

    const questions = await User.findById(id).populate("questions");
    console.log(questions)
    
    res.render("user",{user,questions});
})

module.exports = router;