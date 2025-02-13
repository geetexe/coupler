const validator = require('validator');

const validateSignUpData = req => {
    const { firstName, lastName, emailId, password } = req.body || {};
    let error = null;

    if(!firstName || !lastName){
        error = 'Name is not valid!';
    }


    if(error){
        throw new Error(error);
    }
}

const validateEditProfileData = req => {
    const allowedEditFields = ['firstName', 'lastName', 'gender', 'age', 'about', 'skills', 'photoUrl'];
    const isEditAllowed = Object.keys(req.body).every(field => allowedEditFields.includes(field));
    return isEditAllowed;
}

module.exports = {
    validateSignUpData,
    validateEditProfileData
};