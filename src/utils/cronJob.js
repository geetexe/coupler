const cron = require('node-cron');
const { subDays, startOfDay, endOfDay } = require('date-fns');
const ConnectionRequestModel = require('../models/connectionRequest');
const sendEmail = require('./sendEmail');

cron.schedule("0 8 * * *", async () => {

    // const yesterday = subDays(new Date(), 1);
    const yesterday = new Date();

    const yesterdayStart = startOfDay(yesterday);
    const yesterdayEnd = endOfDay(yesterday);


    // send emails to all people who got requests the previous day:
    try {
        const pendingRequestsFromYesterday = await ConnectionRequestModel.find({
            status: 'interested',
            createdAt: {
                $gte: yesterdayStart,
                $lt: yesterdayEnd
            }
        }).populate("fromUserId toUserId");

        const listOfEmails = [...new Set(pendingRequestsFromYesterday.map(req => req.toUserId.email))];


        for(const email of listOfEmails){
            try{
                const res = await sendEmail.run("Pending action: " + email);
                console.log({res});
            }
            catch(error){
                console.error(error);
            }
        }


        console.log({listOfEmails});
    }
    catch(error){
        console.error(error);
    }
});