const mongoose = require('mongoose');
const CONNECTION_STRING = 'mongodb+srv://geetexe:ehQ5ZluLfP17Wuz8@cluster0.8bxsj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/coupler';

const connectDB = async () => {
    await mongoose.connect(CONNECTION_STRING);
}

module.exports = connectDB;