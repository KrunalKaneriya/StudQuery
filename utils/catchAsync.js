module.exports = (func) => {
	return (req, res, next) => {
		func(req, res, next).catch(next);
	};
};

//This file contains a single function known as catchAsync
//Now this function returns a function and after that it calls
//that function and if there is any error found then it calls
//the catch block and goes to other function.
