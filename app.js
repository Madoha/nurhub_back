require('dotenv').config({ path: `${process.cwd()}/.env` });
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { createServer } = require('http');
const { initializeSocket } = require('./utils/socket');

const authRouter = require('./route/authRoute');
const userRouter = require('./route/userRoute');
const courseRouter = require('./route/courseRouter');
const catchAsync = require('./utils/catchAsync');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./middlewares/errorMiddleware');

const app = express();
const httpServer = createServer(app);

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));

// route
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/course', courseRouter);

app.use('*', catchAsync(async (req, res, next) => {
    throw new AppError('Page not found', 404);
}));

app.use(globalErrorHandler);

(async () => {
    await initializeSocket(httpServer);

    const PORT = process.env.APP_PORT || 4000;
    httpServer.listen(PORT, () => {
        console.log(`server listening on ${PORT}`)
    })
})();