const express = require("express");
const app = express();
const connectDB = require('./config/database');
const cookieParser = require('cookie-parser');
const cors = require('cors');

require("dotenv").config();

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

app.use('/', authRouter);
app.use('/', profileRouter);
app.use('/', requestsRouter);
app.use('/', userRouter);

// ROUTES - END ============================================

const PORT = 7777;

const spinServer = () => {
    app.listen(PORT, () => console.log(`Server is listening on PORT: ${PORT}`));
}

connectDB().then(() => {
    console.log("Connection to the database established successfully!");
    spinServer();
}).catch(err => console.log("Could not connect to the database!", err));