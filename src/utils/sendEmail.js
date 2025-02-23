const { SendEmailCommand } = require("@aws-sdk/client-ses");
const { sesClient } = require("./sesClient.js");

const createSendEmailCommand = (toAddress, fromAddress, message, initiator) => {
    return new SendEmailCommand({
      Destination: {
        CcAddresses: [
          /* more items */
        ],
        ToAddresses: [
          toAddress,
          /* more To-email addresses */
        ],
      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: `
                <h1>Hola, ${initiator}!</h1>
                <p>${message}</p>
            `,
          },
          Text: {
            Charset: "UTF-8",
            Data: "This is the text format email!",
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: `Hey, ${initiator}! You have a notification!`,
        },
      },
      Source: fromAddress,
      ReplyToAddresses: [
        /* more items */
      ],
    });
};

const run = async (message, initiator) => {
    const sendEmailCommand = createSendEmailCommand(
      "geet.exe@gmail.com",
      "donotreply@coupler.in",
      message,
      initiator
    );
  
    try {
        return await sesClient.send(sendEmailCommand);
    } catch (caught) {
      if (caught instanceof Error && caught.name === "MessageRejected") {
        /** @type { import('@aws-sdk/client-ses').MessageRejected} */
        const messageRejectedError = caught;
        return messageRejectedError;
      }
      throw caught;
    }
};

module.exports = { run };