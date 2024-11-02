require('dotenv').config({path: `${process.cwd()}/.env`});
const express = require('express');
const cors = require('cors');
const catchAsync = require('./utils/catchAsync');
const authRouter = require('./route/authRoute');
const userRouter = require('./route/userRoute');
const globalErrorHandler = require('./middlewares/errorMiddleware');
const AppError = require('./utils/appError');
const cookieParser = require('cookie-parser');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));

// route
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);

app.use('*', catchAsync(async (req, res, next) => {
    throw new AppError('Page not found', 404);
}));

app.use(globalErrorHandler);

const PORT = process.env.APP_PORT || 4000;

app.listen(PORT, () => {
    console.log('server listening');
})