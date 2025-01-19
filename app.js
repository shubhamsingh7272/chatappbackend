const express = require('express')
const app = express()
const authRouter= require('./controllers/authController')
const friendsRouter = require('./controllers/friendsController')
const chatRouter = require('./controllers/chatController');
const messageRouter = require('./controllers/messageController');
const path = require('path');
app.use(express.json())
app.use('/api/auth',authRouter)
app.use('/api/friends',friendsRouter)
app.use('/api/chat', chatRouter);
app.use('/api/message', messageRouter);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//app.use('/api/user',userRouter)
//app.use('/api/chat', chatRouter);
//app.use('/api/message', messageRouter);


module.exports = app 