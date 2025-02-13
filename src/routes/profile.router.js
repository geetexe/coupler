const express = require('express');
const bcrypt = require('bcrypt');
const profileRouter = express.Router();
const { userAuth } = require('./../middlewares/auth');
const { validateEditProfileData } = require('../utils/validation');
const User = require('../models/user');

profileRouter.get('/profile/view', userAuth, (req, res) => {
    try{
        const { user } = req || {};
        return res.status(200).send(user);
    }
    catch(err){
        res.status(400).send(`Error: ${err.message}`);
    }
});

profileRouter.patch('/profile/edit', userAuth, async (req, res) => {
    try{
        const { user } = req || {};
        const isEditAllowed = validateEditProfileData(req);
        if(!isEditAllowed){
            throw new Error('Invalid edit request!');
        }

        Object.keys(req.body).forEach(field => user[field] = req.body[field]);

        const userData = await user.save();
        if(!userData){
            throw new Error('Could not update the user. Please try again later.');
        }
        res.status(201).json({
            message: 'User updated successfully!',
            user: userData
        });
    }
    catch(error){
        res.status(400).send(`Error: ${error?.message}`);
    }
});

profileRouter.patch('/profile/password', userAuth, async (req, res) => {
    try{
        const { user } = req || {};
        const { oldPassword, newPassword } = req.body || {};
        const _user = await User.findById(user._id);
        const isOldPasswordValid = await _user.validatePassword(oldPassword);
        if(!isOldPasswordValid){
            throw new Error('Old password is not valid! Please try again later.');
        }
        const password = await bcrypt.hash(newPassword, 10);
        _user['password'] = password;
        const updatedData = await _user.save();
        if(!updatedData){
            throw new Error("Something went wrong! Please try again later!");
        }
        res.status(200).cookie('token', null, {
            expires: new Date(Date.now())
        }).send("Password has been updated successfully! Please login again.");

    }
    catch(error){
        res.status(400).send("Error: " + error?.message);
    }
});

module.exports = profileRouter;