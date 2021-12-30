const express = require('express');
const mongoose = require("mongoose");

const app = express();


app.listen(3000,() => {
    console.log('Started Server At Port 3000');
})