require('dotenv').config({path: `${process.cwd()}/.env`});
const express = require('express');
const cors = require('cors');
const catchAsync = require('./utils/catchAsync');
const authRouter = require('./route/authRoute');
const userRouter = require('./route/userRoute');
const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');

const app = express();
app.use(cors());
app.use(express.json());

// route
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/user', userRouter);

app.use('*', catchAsync(async (req, res, next) => {
    throw new AppError('Page not found', 404);
}));

app.use(globalErrorHandler);

const PORT = process.env.APP_PORT || 4000;

app.listen(PORT, () => {
    console.log('server listening');
})