const express = require('express');
const requestsRouter = express.Router();
const { userAuth } = require('./../middlewares/auth');
const ConnectionRequestModel = require('../models/connectionRequest');
const User = require('../models/user');

const sendEmail = require('./../utils/sendEmail');

requestsRouter.post('/request/send/:status/:toUserId', userAuth, async (req, res) => {
    try{
        const { toUserId, status } = req.params;
        const { _id:fromUserId } = req.user?._id;
        const initiator = req.user.firstName;
        if(fromUserId === toUserId){
            throw new Error('You cannot send a connection request to yourself.');
        }
        const toUser = await User.findById(toUserId);
        if(!toUser){
            return res.status(404).json({
                message: "User not found!"
            });
        }
        const allowedStatuses = ['interested', 'ignored'];
        if(!allowedStatuses.includes(status)){
            return res.status(400).json({
                message: `Invalid status type: ${status}`
            })
        }
        // check if there is a connection request existing between from and to already:
        const checkExistingRequest = await ConnectionRequestModel.findOne({
            $or: [
                { fromUserId, toUserId },
                { toUserId:fromUserId, fromUserId:toUserId }
            ]
        });
        if(checkExistingRequest){
            return res.status(400).json({
                message: 'Connection request already exists!'
            });
        }
        const connectionRequest = new ConnectionRequestModel({
            fromUserId, toUserId, status
        });
        const data = await connectionRequest.save();
        const message = status === 'interested' ? `Connection request to ${toUser.firstName} was sent successfully!` : `Connection request to ${toUser.firstName} has been ignored.`;
        console.log(message);
        await sendEmail.run(message, initiator);
        res.status(200).json({ message, data });
    }
    catch(error){
        console.error(error);
        res.status(400).send(`ERROR: ${error.message}`);
    }
});

requestsRouter.post('/request/review/:status/:requestId', userAuth, async(req, res) => {
    try{
        const { status, requestId } = req.params;
        const loggedInUser = req.user;

        const allowedStatuses = ['accepted', 'rejected'];
        if(!allowedStatuses.includes(status)){
            throw new Error('Invalid status type!');
        }

        const connectionRequest = await ConnectionRequestModel.findOne({
            _id: requestId,
            toUserId: loggedInUser._id,
            status: 'interested'
        });
        if(!connectionRequest){
            return res.status(404).json({
                message: 'Invalid connection request!'
            });
        }
        connectionRequest.status = status;

        const data = await connectionRequest.save();

        res.status(200).json({
            message: "Connection request marked as " + status, data
        });
    }
    catch(error){
        res.status(400).json({ 
            message: `Error: ${error.message}` 
        });
    }
});

module.exports = requestsRouter;