const validator = require('validator');

const validateSignUpData = (req) => {
    const { firstName, lastName, emailId, password } = req.body || {};
    let error = null;

    if(!firstName || !lastName){
        error = 'Name is not valid!';
    }


    if(error){
        throw new Error(error);
    }
}

module.exports = {
    validateSignUpData
};