const User = require('./../models/user');

const checkFriendship = async (req, res, next) => {
  const { userId1, userId2 } = req.body; // Or req.params, depending on the route

  try {
    const user1 = await User.findById(userId1).populate('friends');
    const user2 = await User.findById(userId2).populate('friends');

    if (!user1 || !user2) {
      return res.status(404).json({ message: 'One or both users not found.' });
    }

    const isFriend = user1.friends.some(friend => friend._id.equals(userId2));

    if (!isFriend) {
      return res.status(403).json({ message: 'Users are not friends. Chat not allowed.' });
    }

    next(); // Proceed to the next middleware/controller
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = checkFriendship;
