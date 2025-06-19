const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');
const Nominee = require('../models/nominee');
const User = require('../models/user');
const { authenticateToken, requireAdmin, requireUser } = require('../middleware/auth');

const router = express.Router();

// Add nominee (Admin only)
router.post('/nominees', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    const imageFile = req.files?.image;

    if (!name || !imageFile) {
      return res.status(400).json({ message: 'Name and image are required' });
    }

    const imagePath = `uploads/${Date.now()}_${imageFile.name}`;
    await imageFile.mv(path.join(__dirname, '..', imagePath));

    const nominee = new Nominee({ name, imageUrl: imagePath });
    await nominee.save();

    res.status(201).json({ 
      message: 'Nominee added successfully',
      nominee: {
        id: nominee._id,
        name: nominee.name,
        imageUrl: nominee.imageUrl
      }
    });
  } catch (err) {
    console.error('Error adding nominee:', err);
    res.status(500).json({ message: 'Error saving nominee' });
  }
});

// Delete nominee (Admin only)
router.delete('/nominees/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const nominee = await Nominee.findById(req.params.id);
    
    if (!nominee) {
      return res.status(404).json({ message: 'Nominee not found' });
    }

    // Delete image file
    if (nominee.imageUrl) {
      const imagePath = path.join(__dirname, '..', nominee.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Remove votes from users who voted for this nominee
    await User.updateMany(
      { votedFor: nominee._id },
      { $set: { voted: false, votedFor: null } }
    );

    await Nominee.findByIdAndDelete(req.params.id);
    res.json({ message: 'Nominee deleted successfully' });
  } catch (err) {
    console.error('Error deleting nominee:', err);
    res.status(500).json({ message: 'Error deleting nominee' });
  }
});

// Get all nominees (for user vote page, no vote count exposed)
router.get('/nominees', authenticateToken, requireUser, async (req, res) => {
  try {
    const nominees = await Nominee.find({}, { votes: 0 }); // Hide vote count
    res.json(nominees);
  } catch (err) {
    console.error('Error fetching nominees:', err);
    res.status(500).json({ message: 'Failed to fetch nominees' });
  }
});

// Vote for a nominee (User only, one vote per user)
router.post('/nominees/:id/vote', authenticateToken, requireUser, async (req, res) => {
  try {
    const user = req.user;
    
    if (user.voted) {
      return res.status(400).json({ message: 'You have already voted' });
    }

    const nominee = await Nominee.findById(req.params.id);
    if (!nominee) {
      return res.status(404).json({ message: 'Nominee not found' });
    }

    // Update nominee vote count
    await Nominee.findByIdAndUpdate(req.params.id, {
      $inc: { votes: 1 }
    });

    // Update user voting status
    await User.findByIdAndUpdate(user._id, {
      voted: true,
      votedFor: nominee._id
    });

    res.json({ message: 'Vote counted successfully' });
  } catch (err) {
    console.error('Error voting:', err);
    res.status(500).json({ message: 'Failed to vote' });
  }
});

// Get user's voting status
router.get('/user/vote-status', authenticateToken, requireUser, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('votedFor', 'name');
    res.json({
      voted: user.voted,
      votedFor: user.votedFor
    });
  } catch (err) {
    console.error('Error fetching vote status:', err);
    res.status(500).json({ message: 'Failed to fetch vote status' });
  }
});

// Get all nominees with votes (Admin view only)
router.get('/admin/nominees', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const nominees = await Nominee.find().sort({ votes: -1 }); // Sort by votes descending
    res.json(nominees);
  } catch (err) {
    console.error('Error fetching admin nominees:', err);
    res.status(500).json({ message: 'Error fetching nominees' });
  }
});

// Get voting statistics (Admin only)
router.get('/admin/statistics', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const votedUsers = await User.countDocuments({ role: 'user', voted: true });
    const totalNominees = await Nominee.countDocuments();
    const totalVotes = await Nominee.aggregate([
      { $group: { _id: null, total: { $sum: '$votes' } } }
    ]);

    res.json({
      totalUsers,
      votedUsers,
      totalNominees,
      totalVotes: totalVotes[0]?.total || 0,
      participationRate: totalUsers > 0 ? ((votedUsers / totalUsers) * 100).toFixed(2) : 0
    });
  } catch (err) {
    console.error('Error fetching statistics:', err);
    res.status(500).json({ message: 'Error fetching statistics' });
  }
});

module.exports = router;
