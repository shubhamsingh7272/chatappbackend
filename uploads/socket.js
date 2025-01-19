// socket.js
const socketIo = require('socket.io');
const Chat = require('./../models/chat');
const User = require('./../models/user');
const authenticateToken = require('./../middlewares/authenticateToken'); // Import the middleware

const setupSocket = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: "*", // Adjust this for production (e.g., frontend domain)
      methods: ["GET", "POST"],
    },
  });

  // Socket.IO middleware for authentication
  io.use((socket, next) => {
    // Extract the token from the handshake query or headers
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }

    // Mock the request object for the middleware
    const req = { header: () => token };
    const res = {
      status: (code) => ({
        json: (data) => {
          if (code === 401 || code === 403) {
            return next(new Error(data.error));
          }
        },
      }),
    };

    // Use the authenticateToken middleware
    authenticateToken(req, res, () => {
      socket.user = req.user; // Attach the user payload to the socket
      next();
    });
  });

  // Socket.IO connection handler
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.user.id);

    // Handle user joining a chat
    socket.on('joinChat', async ({ chatId }) => {
      try {
        const chat = await Chat.findOne({ chatId });

        if (!chat) {
          return socket.emit('error', { message: 'Chat not found.' });
        }

        // Check if the user is a participant in the chat
        if (!chat.participants.includes(socket.user.id)) {
          return socket.emit('error', { message: 'You are not a participant in this chat.' });
        }

        // Join the chat room
        socket.join(chatId);
        console.log(`User  ${socket.user.id} joined chat ${chatId}`);

        // Notify all users in the chat room
        io.to(chatId).emit('message', {
          senderId: 'system',
          content: `User  ${socket.user.id} has joined the chat.`,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error(error);
        socket.emit('error', { message: 'Error joining chat.' });
      }
    });

    // Handle sending messages in the chat
    socket.on('sendMessage', async ({ chatId, message }) => {
      try {
        const chat = await Chat.findOne({ chatId });
        if (!chat) return socket.emit('error', { message: 'Chat not found.' });

        // Add message to chat's messages array
        chat.messages.push({
          senderId: socket.user.id,
          content: message,
          timestamp: new Date(),
        });

        await chat.save();

        // Broadcast message to chat room
        io.to(chatId).emit('newMessage', {
          senderId: socket.user.id,
          content: message,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error(error);
        socket.emit('error', { message: 'Error sending message.' });
      }
    });

    // Handle user disconnecting
    socket.on('disconnect', () => {
      console.log('User  disconnected:', socket.user.id);
    });
  });

  return io;
};

module.exports = setupSocket;