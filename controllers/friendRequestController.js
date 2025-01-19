const User = require('./../models/user');
const FriendRequest = require('./../models/friendRequestModel');

// Send a friend request
const sendFriendRequest = async (req, res) => {
  try {
    const { receiverId } = req.body;

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ error: 'Receiver not found' });
    }

    // Check if the sender is trying to send a request to themselves
    if (req.user.id === receiverId) {
      return res.status(400).json({ error: 'You cannot send a friend request to yourself' });
    }

    // Check if a request already exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: req.user.id, receiver: receiverId },
        { sender: receiverId, receiver: req.user.id },
      ],
    });

    if (existingRequest) {
      return res.status(400).json({ error: 'Friend request already exists' });
    }

    // Create a new friend request (status is pending by default)
    const newRequest = new FriendRequest({
      sender: req.user.id,
      receiver: receiverId,
    });

    await newRequest.save();
    res.json({ message: 'Friend request sent' });
  } catch (err) {
    res.status(500).json({ error: 'Error sending friend request', details: err.message });
  }
};

// Accept a friend request
const acceptFriendRequest = async (req, res) => {
    try {
      const { requestId } = req.body;
  
      // Find the friend request
      const request = await FriendRequest.findById(requestId);
      if (!request) {
        return res.status(404).json({ error: 'Request not found' });
      }
  
      // Check if the logged-in user is the receiver
      if (request.receiver.toString() !== req.user.id) {
        return res.status(400).json({ error: 'You are not authorized to accept this request' });
      }
  
      // Check if the request is already accepted
      if (request.status === 'accepted') {
        return res.status(400).json({ error: 'This request has already been accepted' });
      }
  
      // Update the status to 'accepted'
      request.status = 'accepted';
      await request.save();
  
      // Add both users to each other's friends list
      const sender = await User.findById(request.sender);
      const receiver = await User.findById(request.receiver);
  
      // Check if sender and receiver exist
      if (!sender || !receiver) {
        return res.status(404).json({ error: 'Sender or receiver not found' });
      }
  
      // Add each other as friends
      sender.friends.push(receiver._id);
      receiver.friends.push(sender._id);
  
      // Save the updated user data
      await sender.save();
      await receiver.save();
  
      // Send a successful response
      res.json({ message: 'Friend request accepted' });
    } catch (err) {
      res.status(500).json({ error: 'Error accepting friend request', details: err.message });
    }
  };
  

// Reject a friend request
const rejectFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.body;

    // Find the friend request
    const request = await FriendRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Check if the logged-in user is the receiver
    if (request.receiver.toString() !== req.user.id) {
      return res.status(400).json({ error: 'You are not authorized to reject this request' });
    }

    // Update the status to 'rejected'
    request.status = 'rejected';
    await request.save();

    res.json({ message: 'Friend request rejected' });
  } catch (err) {
    res.status(500).json({ error: 'Error rejecting friend request', details: err.message });
  }
};

// Show all pending friend requests for the logged-in user
const showFriendRequests = async (req, res) => {
  try {
    // Find all friend requests where the logged-in user is the receiver and the status is 'pending'
    const pendingRequests = await FriendRequest.find({
      receiver: req.user.id,
      status: 'pending',
    }).populate('sender', 'name email'); // Populate sender information (like name, email)

    if (!pendingRequests || pendingRequests.length === 0) {
      return res.status(200).json({ message: 'No pending friend requests' });
    }

    res.json({ friendRequests: pendingRequests });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching friend requests', details: err.message });
  }
};

module.exports = { sendFriendRequest, acceptFriendRequest, rejectFriendRequest, showFriendRequests };



