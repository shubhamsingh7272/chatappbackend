const User = require('./../models/user');

// Controller to recommend friends based on mutual friends
const recommendFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('friends');

    if (!user) {
      return res.status(404).json({ error: 'Authenticated user not found' });
    }

    // Get the user's friends' IDs
    const friendIds = user.friends.map(friend => friend._id);

    // Find users who are friends with the user's friends but not the user themselves
    const recommendedFriends = await User.find({
      _id: { $nin: [...friendIds, user._id] },  // Exclude the user and their direct friends
      friends: { $in: friendIds }  // The user has at least one mutual friend
    }).populate('friends', 'name username').select('-password');

    res.json({ recommendedFriends });
  } catch (err) {
    console.error('Error recommending friends:', err);
    res.status(500).json({ error: 'Error recommending friends', details: err.message });
  }
};

module.exports = { recommendFriends };
