const express = require("express");
const app = express();
const connectDB = require('./config/database');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');

app.use(express.json());
app.use(cookieParser());

const User = require('./models/user');
const { validateSignUpData } = require('./utils/validation');

const PORT = 7777;

app.post('/signUp', async (req, res) => {
    try{
        const { firstName, lastName, email, password, age, gender } = req.body || {};
        
        validateSignUpData(req);

        const passwordHash = await bcrypt.hash(password, 10);
        
        const user = new User({
            firstName, 
            lastName, 
            email, 
            age, 
            gender,
            password: passwordHash
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

app.post('/login', async (req, res) => {
    try{
        const {emailId, password} = req.body || {};
        const user = await User.findOne({email: emailId});
        if(!user){
            throw new Error("Invalid credentials! Please try again later.");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid){
            throw new Error("Invalid credentials! Please try again later.");
        }
        return res.status(200).send("Login successful!");
    }
    catch(err){
        res.status(500).send("Error: " + err?.message);
    }
});

app.get('/user', async (req, res) => {
    const { email } = req.body;
    try{
        const users = await User.find({ email });
        if(users.length){
            res.status(200).send(users);
        }
        else{
            res.status(404).send("User not found!");
        }
    }
    catch(err) {
        res.status(400).send("Something went wrong!");
    }
});

app.get('/feed', async (req, res) => {
    try{
        const users = await User.find({});
        res.status(200).send(users);
    }
    catch(err){
        res.status(400).send("Something went wrong!");
    }
});

app.get('/user/:id', async (req, res) => {
    const { id } = req.params;
    try{
        const user = await User.findById(id);
        if(user){
            req.send(200).send(user);
        }
        else{
            req.send(404).send("User not found!");
        }
    }
    catch(err){
        req.status(500).send("Something went wrong!");
    }
});

app.delete('/user', async (req, res) => {
    const { id } = req.body;
    try{
        const user = await User.findByIdAndDelete(id);
        if(user){
            res.status(201).send("User deleted!");
        }
        res.status(404).send("User not found!");
    }
    catch(err){
        res.status(500).send("Something went wrong!");
    }
});

app.patch('/user/:userId', async (req, res) => {
    const data = req.body;
    const { userId } = req.params; 
    const {...userData} = data || {};
    try{
        const ALLOWED_UPDATES = ['age', 'gender', 'photoUrl', 'about', 'skills'];
        const isUpdateAllowed = userData.every(field => ALLOWED_UPDATES.includes(field));
        if(!isUpdateAllowed){
            throw new Error('Update is not allowed!');
        }
        if(userData?.skills?.length > 10){
            throw new Error('Skills cannot be more than 10!');
        }
        const user = await User.findByIdAndUpdate(userId, userData, {
            returnDocument: 'after',
            runValidators: true
        });
        if(user){
            return res.status(200).send("User updated!");
        }
        return res.status(404).send("User not found!");
    }
    catch(err){
        return res.status(500).send("Something went wrong");
    }
});

//update user by user's email id:
app.patch('/user/email', async (req, res) => {
    const data = req.body;
    const { email } = data || {};
    try{
        if(!email){
            return res.status(404).send("User not found!");
        }
        const user = await User.findOneAndUpdate({email}, data, {returnDocument: 'after'});
        if(user){
            return res.status(200).json({user, message: 'User updated successfully!'});
        }
        return res.status(400).send("Something went wrong, please check again later!");
    } catch(err){
        return res.status(500).send("Something went wrong!");
    }
});

const spinServer = () => {
    app.listen(PORT, () => console.log(`Server is listening on PORT: ${PORT}`));
}

connectDB().then(() => {
    console.log("Connection to the database established successfully!");
    spinServer();
}).catch(err => console.log("Could not connect to the database!", err));

