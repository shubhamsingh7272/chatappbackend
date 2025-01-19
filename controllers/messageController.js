const express = require('express');
const multer = require('../middlewares/multerConfig'); // Multer configuration for file upload
const Chat = require('./../models/chat');
const User = require('./../models/user');
const router = express.Router();

// Route for sending a message (with or without media)
router.post('/:chatId', multer.single('media'), async (req, res) => {
  const { chatId } = req.params;
  const { senderId, messageType, content } = req.body;

  try {
    // Find the chat
    const chat = await Chat.findOne({ chatId });
    if (!chat) return res.status(404).json({ message: 'Chat not found.' });

    // Check if sender is a participant in the chat
    if (!chat.participants.includes(senderId)) {
      return res.status(403).json({ message: 'You are not a participant in this chat.' });
    }

    // Validate that participants are friends
    const [userId1, userId2] = chat.participants;
    const user = await User.findById(userId1); // Checking friendship for user1
    const isFriend = user.friends.some(friend => friend._id.equals(userId2)); // Checking if user1 and user2 are friends

    if (!isFriend) {
      return res.status(403).json({ message: 'Users are not friends. Message not allowed.' });
    }

    // Handle media upload (if any)
    let messageContent = content || null; // Default message content is null if no content is provided
    if (req.file) {
      messageContent = `/uploads/${req.file.filename}`; // Save the uploaded file path
    }

    // Create the message object
    const newMessage = {
      senderId,
      messageType, // e.g., text, image, video, file
      content: messageContent,
      timestamp: new Date(),
    };

    // Add the new message to the chat
    chat.messages.push(newMessage);
    await chat.save();

    // Send the new message as a response
    res.status(201).json(newMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
