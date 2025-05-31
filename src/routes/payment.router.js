const express = require('express');
const paymentRouter = express.Router();
const { userAuth } = require('./../middlewares/auth');
const razorpayInstance = require('../utils/razorpay');
const Payment = require('../models/payment');
const membershipAmount = require('../utils/constants');
const { validateWebhookSignature } = require('razorpay/dist/utils/razorpay-utils');
const User = require('../models/user');

paymentRouter.post('/createOrder', userAuth, async (req, res) => {
    try{
        const { membershipType } = req.body || {};
        const { firstName, lastName, email } = req.user || {};

        // Call RazorPay to initialise the payment and get back the order ID
        const order = await razorpayInstance.orders.create({
            amount: membershipAmount[membershipType] * 100,
            currency: "INR",
            receipt: "receipt#1",
            notes: { firstName, lastName, membershipType }
        });

        // Store the initialised order in the DB
        const { id:orderId, status, amount, currency, receipt, notes } = order || {};
        const payment = new Payment({
            userId: req.user._id, 
            orderId, status, amount, currency, receipt, notes
        });
        const savedPayment = await payment.save();

        // Respond to the frontend with appropriate data
        res.status(201).json({ ...savedPayment.toJSON(), rzpKeyId: process.env.RAZORPAY_KEY_ID });
    }
    catch(err){}
});

paymentRouter.post('/payment/webhook', async (req, res) => {
    console.log("hey");
    try{
        console.log("inside try...");
        const webhookSignature = req.get('X-Razorpay-Signature');
        console.log(webhookSignature);
        const isWebhookValid = validateWebhookSignature(
            JSON.stringify(req.body), 
            webhookSignature, 
            process.env.RAZORPAY_WEBHOOK_SECRET
        );
        console.log('0', isWebhookValid);
        if(!isWebhookValid){
            return res.status(400).json({
                message: 'Webhook signature is invalid.'
            });
        }
console.log('1', req.body.event);
        const paymentDetails = req.body.payload.payment.entity;
        const payment = await Payment.findOne({ orderId: paymentDetails.order_id });
        payment.status = paymentDetails.status;
        await payment.save();

        console.log(req.body.event);
        // if(req.body.event === 'payment.captured'){
            const user = User.findOne({ _id: payment.userId });
            user.isPremium = true;
            user.membershipType = payment.notes.membershipType;
            await user.save();
        // }
        // else if(req.body.event === 'payment.failed'){}



        return res.status(200).json({
            message: 'Webhook execution is successful!'
        });
    }
    catch(err){
        console.log(err);
    }
});

module.exports = paymentRouter;