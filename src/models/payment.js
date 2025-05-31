const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    receipt: {
        type: String,
        required: true
    },
    paymentId: {
        type: String
    },
    userId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "User",
        required: true
    },
    notes: {
        firstName: {
            type: String
        },
        lastName: {
            type: String
        },
        membershipType: {
            type: String
        }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Payment", paymentSchema);