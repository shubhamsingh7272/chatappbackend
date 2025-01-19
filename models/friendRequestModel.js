const mongoose = require('mongoose');

const friendRequestSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // User sending the request
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // User receiving the request
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }, // Request status
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('FriendRequest', friendRequestSchema);
