const { Server } = require('socket.io');
const AppError = require('./appError');
let io;

const initializeSocket = async (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL,
            credentials: true,
        },
    });

    io.on('connection', (socket) => {
        console.log(`user succe connected ${socket.id}`);
        socket.on('disconnect', () => {
            console.log(`user disconnected ${socket.id}`)
        });
    });

    return io;
};

const sendAchievementNotification = (userId, userAchievement) => {
    if (!io) throw new Error('Socket.io not initialized');
    io.to(`user_${userId}`).emit('achievementUnlocked', userAchievement);
}

module.exports = {
    initializeSocket,
    sendAchievementNotification 
}