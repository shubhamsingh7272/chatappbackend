const User = require('./../models/user');

// Controller to search users by name or username
const searchUsers = async (req, res) => {
  const { query } = req.query;  // Get search query from request

  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  try {
    // Search users by name or username (case-insensitive)
    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },  // Search by name (case-insensitive)
        { username: { $regex: query, $options: 'i' } },  // Search by username (case-insensitive)
      ],
    }).select('-password');

    res.json({ users });
  } catch (err) {
    console.error('Error searching users:', err);
    res.status(500).json({ error: 'Error searching users', details: err.message });
  }
};

module.exports = { searchUsers };
