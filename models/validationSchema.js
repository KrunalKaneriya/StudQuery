const joi = require("joi");
const { identity } = require("lodash");
const ExpressError = require("../utils/ExpressError");


const questionValidator = (req,res,next) => {
    const questionSchemaValidator = joi.object({
        questionTitle:joi.string().required(),
        questionDescription:joi.string().min(20).required(),
        tags:joi.string().required()
    })

    const {error} = questionSchemaValidator.validate(req.body);

    if(error) {
        const msg = error.details.map(el => el.message).join(",");
        throw new ExpressError(401,msg);
    }
    next();
}

const signUpValidator = (req,res,next) => {
    const userValidator = joi.object({
        username:joi.string().min(3).required(),
        email:joi.string().email().required(),
        age:joi.number().required(),
        password:joi.string().min(6).max(20).required(),
        studyingIn:joi.string().required(),
        city:joi.string().required(),
        alias:joi.string().required(),
        description:joi.string().required()
    })

    const {error} = userValidator.validate(req.body);

    if(error) {
        const msg = error.details.map(el => el.message).join(",");
        throw new ExpressError(401,msg);
    }
    next();
}


const logInValidator = (req,res,next) => {
    const logInValidator = joi.object({
        username:joi.string().required(),
        password:joi.string().required(),
    })

    //First checks the data is given by user and after that
    //If there is error then the error is saved to error object 
    const {error} = logInValidator.validate(req.body);

    if(error) {
        const msg = error.details.map(el => el.message).join(",");
        throw new ExpressError(401,msg);
    }

    //This calls the next function
    next();
}


module.exports = {questionValidator,signUpValidator,logInValidator};