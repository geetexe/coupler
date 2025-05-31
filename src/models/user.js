const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

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
    age: {
        type: Number,
        min: 18,
    },
    gender: {
        type: String,
        enum: {
            values: ['male', 'female', 'others'],
            message: `{VALUE} is not valid.`
        },
        // validate(value){
        //     if(!['male', 'female', 'others'].includes(value)){
        //         throw new Error('Invalid gender type!');
        //     }
        // }
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
    },
    isPremium: {
        type: Boolean,
        default: false
    },
    membershipType: {
        type: String,
    }
}, { timestamps: true });

userSchema.methods.getJWT = async function() {
    const user = this;
    const payload = {
        id: user._id
    };
    const token = await jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: '7d' });
    return token;
}

userSchema.methods.validatePassword = async function(password) {
    const user = this;
    const isPasswordValid = await bcrypt.compare(password, user.password);
    return isPasswordValid;
}

const User = mongoose.model('User', userSchema);

module.exports = User;