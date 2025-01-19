const express = require('express');
const User = require('./../models/user');
const authenticateToken = require('../middlewares/authenticateToken');

const router = express.Router();
const { searchUsers }= require('./searchController')

const { recommendFriends } = require('./recommendFriendsController')
const { sendFriendRequest, acceptFriendRequest, rejectFriendRequest ,showFriendRequests} = require('./friendRequestController');


// Add a Friend
/*router.post('/add', authenticateToken, async (req, res) => {
    const { friendId } = req.body;
  
    try {
      // Fetch the authenticated user
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'Authenticated user not found' });
      }
  
      // Fetch the friend
      const friend = await User.findById(friendId);
      if (!friend) {
        return res.status(404).json({ error: 'Friend not found' });
      }
  
      // Check if already friends
      if (user.friends.includes(friend._id.toString())) {
        return res.status(400).json({ error: 'Already friends' });
      }
  
      // Add friend to both users
      user.friends.push(friend._id);
      friend.friends.push(user._id);
  
      await user.save();
      await friend.save();
  
      res.json({ message: 'Friend added successfully', friends: user.friends });
    } catch (err) {
      console.error('Error adding friend:', err);
      res.status(500).json({ error: 'Error adding friend', details: err.message });
    }
  });*/
  

// Remove a Friend
router.post('/remove', authenticateToken, async (req, res) => {
    const { friendId } = req.body;
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      const friend = await User.findById(friendId);
      if (!friend) {
        return res.status(404).json({ error: 'Friend not found' });
      }
  
      // Check if both users are friends
      if (!user.friends.includes(friend._id)) {
        return res.status(400).json({ error: 'Not friends yet' });
      }
  
      // Remove the friend from both users' friends list
      user.friends = user.friends.filter(id => id.toString() !== friendId);
      friend.friends = friend.friends.filter(id => id.toString() !== user._id.toString());
  
      // Save the updated friend lists
      await user.save();
      await friend.save();
  
      res.json({ message: 'Friend removed successfully', friends: user.friends });
    } catch (err) {
      res.status(500).json({ error: 'Error removing friend', details: err.message });
    }
  });
  

// Get User's Friends
router.get('/friends', authenticateToken, async (req, res) => {
    try {
      const user = await User.findById(req.user.id)
        .populate('friends', 'name username')
        .select('-password'); // Exclude the password field
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Only include friends who have accepted the request (you can filter based on request status if needed)
      const acceptedFriends = user.friends.filter(friend => friend.status === 'accepted');
      
      res.json({ friends: acceptedFriends });
    } catch (err) {
      res.status(500).json({ error: 'Error fetching friends', details: err.message });
    }
  });
  

router.get('/search', authenticateToken, searchUsers);

router.get('/recommend', authenticateToken, recommendFriends);

router.post('/sendRequest', authenticateToken, sendFriendRequest);

// Accept friend request
router.post('/acceptRequest', authenticateToken, acceptFriendRequest);

// Reject friend request
router.post('/rejectRequest', authenticateToken, rejectFriendRequest);
router.get('/requests', authenticateToken, showFriendRequests);





module.exports = router;
