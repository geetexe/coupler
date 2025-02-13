const express = require('express');
const bcrypt = require('bcrypt');
const authRouter = express.Router();

const User = require('./../models/user');
const { validateSignUpData } = require('./../utils/validation');

authRouter.post('/signUp', async (req, res) => {
    try{
        const { 
            firstName, lastName, 
            email, password, age, 
            gender, photoUrl, 
            about, skills=[] 
        } = req.body || {};
        validateSignUpData(req);
        const passwordHash = await bcrypt.hash(password, 10);
        const user = new User({
            firstName, 
            lastName, 
            email, 
            age, 
            gender,
            password: passwordHash,
            photoUrl,
            about,
            skills
        });
        const savedUser = await user.save();
        if(savedUser){
            res.status(201).send("User has been added!");
        }
    }
    catch(err){
        res.status(500).send("ERROR: " + err?.message);
    }
});

authRouter.post('/login', async (req, res) => {
    try{
        const { email, password } = req?.body || {};
        const user = await User.findOne({ email });
        if(!user){
            throw new Error("Invalid credentials!");
        }
        const isPasswordValid = await user.validatePassword(password);
        if(!isPasswordValid){
            throw new Error("Invalid credentials!");
        }
        const token = await user.getJWT();
        res.cookie('token', token);
        res.status(200).json({ message: 'Authentication successful!', user });
    }
    catch(err){
        res.status(400).send("Error: " + err?.message);
    }
});

authRouter.post('/logout', async (req, res) => {
    res.cookie('token', null, {
        expires: new Date(Date.now())
    });
    res.send("Logged out successfully!");
});

module.exports = authRouter;