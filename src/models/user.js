const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 50,
        trim: true
    },
    lastName: {
        type: String,
        trim: true,
        minLength: 3,
        maxLength: 50
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowerCase: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Invalid email address!');
            }
        }
    },
    password: {
        type: String,
        validate(value){
            if(!validator.isStrongPassword(value)){
                throw new Error('Entered password is weak. Please add a strong one.')
            }
        },
        required: true
    },
    passwordHash: {
        type: String,
    },
    age: {
        type: Number,
        min: 18,
    },
    gender: {
        type: String,
        validate(value){
            if(!['male', 'female', 'others'].includes(value)){
                throw new Error('Invalid gender type!');
            }
        }
    },
    photoUrl: {
        type: String,
        validate(value){
            if(!validator.isURL(value)){
                throw new Error('Invalid photo URL!');
            }
        }
    },
    about: {
        type: String,
        trim: true,
        maxLength: 200,
        minLength: 25
    },
    skills: {
        type: [String]
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;