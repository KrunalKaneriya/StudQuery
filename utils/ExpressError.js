class ExpressError extends Error {
	constructor(statusCode, message) {
		super();
		this.statusCode = statusCode;
		this.message = message;
	}
}

module.exports = ExpressError;

//File which is made for error handling
//This file contains class which sets the error code and message
//and after that returns the both to the user.
