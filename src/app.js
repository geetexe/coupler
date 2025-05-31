const express = require("express");
const app = express();
const connectDB = require('./config/database');
const cookieParser = require('cookie-parser');
const cors = require('cors');

require("dotenv").config();

require("./utils/cronJob");

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// ROUTES - START ==========================================

const authRouter = require('./routes/auth.router');
const profileRouter = require('./routes/profile.router');
const requestsRouter = require('./routes/requests.router');
const userRouter = require("./routes/user.router");
const paymentRouter = require("./routes/payment.router");

app.use('/', authRouter);
app.use('/', profileRouter);
app.use('/', requestsRouter);
app.use('/', userRouter);
app.use('/', paymentRouter);

// ROUTES - END ============================================

const spinServer = () => {
    app.listen(process.env.APPLICATION_PORT, () => console.log(`Server is listening on PORT: ${process.env.APPLICATION_PORT}`));
}

connectDB().then(() => {
    console.log("Connection to the database established successfully!");
    spinServer();
}).catch(err => console.log("Could not connect to the database!", err));