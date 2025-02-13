const express = require('express');
const { userAuth } = require('../middlewares/auth');
const ConnectionRequestModel = require('../models/connectionRequest');
const User = require('../models/user');
const userRouter = express.Router();

const USER_SAFE_DATA = "firstName lastName photoUrl age about skills gender";

// get all the pending connections for the logged in user...
userRouter.get('/user/requests/received', userAuth, async (req, res) => {
    try{
        const loggedInUser = req.user;

        const data = await ConnectionRequestModel.find({
            toUserId: loggedInUser._id,
            status: 'interested'
        }).populate('fromUserId', USER_SAFE_DATA);

        res.status(200).json({ data });
    }
    catch(error){
        res.status(400).json({ message: `ERROR: ${error.message}` });
    }
});

userRouter.get('/user/connections', userAuth, async(req, res) => {
    try{
        const loggedInUser = req.user;
        const connections = await ConnectionRequestModel.find({
            $or: [
                {
                    toUserId: loggedInUser._id,
                    status: 'accepted'
                },
                {
                    fromUserId: loggedInUser._id,
                    status: 'accepted'
                }
            ]
        })
        .populate('fromUserId', USER_SAFE_DATA)
        .populate('toUserId', USER_SAFE_DATA);

        const data = connections.map(row => {
            let connection = row.fromUserId;
            if(connection._id.equals(loggedInUser._id)){
                connection = row.toUserId;
            }
            return connection;
        });

        res.status(200).json({ data });
    }
    catch(error){
        res.status(400).json({ message: "ERROR: " + error.message });
    }
});

userRouter.get('/feed', userAuth, async (req, res) => {
    try{
        const loggedInUser = req.user;
        
        const page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        limit = (limit > 50) ? 50 : limit;
        
        const skip = (page - 1) * limit;

        const linkedConnections = await ConnectionRequestModel.find({
            $or: [
                { fromUserId: loggedInUser._id },
                { toUserId: loggedInUser._id }
            ]
        }).select("fromUserId toUserId");

        
        const hiddenUsersFromFeed = new Set();
        linkedConnections.forEach(connection => {
            hiddenUsersFromFeed.add(connection.fromUserId.toString());
            hiddenUsersFromFeed.add(connection.toUserId.toString());
        });

        const users = await User.find({
            $and: [
                { _id: { $nin: [...hiddenUsersFromFeed] } },
                { _id: { $ne: loggedInUser._id } }
            ]
        }).select(USER_SAFE_DATA).skip(skip).limit(limit);

        res.status(200).json({ users });

    }
    catch(error){
        res.status(400).json({message: "Error: " + error.message});
    }
});

module.exports = userRouter;