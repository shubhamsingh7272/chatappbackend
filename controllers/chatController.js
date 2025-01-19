const express = require('express');
const Chat = require('./../models/chat'); // Assuming the schema is already created
const router = express.Router();
const checkFriendship = require('./../middlewares/checkFriendship');

// Route to start a new chat
router.post('/', checkFriendship, async (req, res) => {
  const { userId1, userId2 } = req.body;

  const chatId = [userId1, userId2].sort().join('_');
  let chat = await Chat.findOne({ chatId });

  if (!chat) {
    chat = new Chat({
      chatId,
      participants: [userId1, userId2],
      messages: []
    });
    await chat.save();
  }

  res.status(200).json(chat);
});

// Route to get chat history
router.get('/:chatId/messages', async (req, res) => {
  const { chatId } = req.params;
  const chat = await Chat.findOne({ chatId });

  if (!chat) return res.status(404).send('Chat not found.');

  res.status(200).json(chat.messages);
});

// Route to get all chats for a user (like WhatsApp home page)
router.get('/user/:userId/chats', async (req, res) => {
  const { userId } = req.params;
  try {
    const chats = await Chat.find({
      participants: { $in: [userId] }
    });

    // Optionally, you can format the chat data to only include the required fields (like chatId, participants, latest message, etc.)
    const formattedChats = chats.map(chat => ({
      chatId: chat.chatId,
      participants: chat.participants,
      lastMessage: chat.messages[chat.messages.length - 1] || {}
    }));

    res.status(200).json(formattedChats);
  } catch (error) {
    res.status(500).send('Error fetching chats.');
  }
});

module.exports = router;
