import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'Somesh@2504';

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
   
    const user = new User({ name, email, password: hashed });
    
    await user.save();
    // Generate JWT
    console.log("user******",user._id,"*******",user.email);
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    console.log("Token*******",token)
    res.status(201).json({
      message: 'User registered successfully',
      user: { id: user._id, name: user.name, email: user.email },
      token
    });
  } catch (err) {
  
    res.status(500).json({ message: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Generate JWT
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({
      user: { id: user._id, name: user.name, email: user.email },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllUsersExceptCurrent = async (req, res) => {
  console.log("get all users ***********")
  try {
    const currentUserId = req.user?.id || req.query.currentUserId;
    if (!currentUserId) return res.status(400).json({ message: 'Current user ID required' });
    const users = await User.find(
      { _id: { $ne: currentUserId } },
      'name email canAccess sharedWith'
    );
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const shareLocation = async (req, res) => {
  try {
    const { fromUserId, toUserId } = req.body;
    if (!fromUserId || !toUserId) {
      return res.status(400).json({ message: 'Both fromUserId and toUserId are required.' });
    }
    // Update sharing user's sharedWith array
    const sharer = await User.findByIdAndUpdate(
      fromUserId,
      { $addToSet: { sharedWith: toUserId } },
      { new: true }
    );
    // Update receiver's canAccess array
    const receiver = await User.findByIdAndUpdate(
      toUserId,
      { $addToSet: { canAccess: fromUserId } },
      { new: true }
    );
    if (!sharer || !receiver) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.status(200).json({ message: 'Location sharing updated successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ message: 'User ID required' });
    
    const user = await User.findById(userId, 'name email sharedWith canAccess');
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const stopSharingLocation = async (req, res) => {
  try {
    const { fromUserId, toUserId } = req.body;
    if (!fromUserId || !toUserId) {
      return res.status(400).json({ message: 'Both fromUserId and toUserId are required.' });
    }
    // Remove sharing
    const sharer = await User.findByIdAndUpdate(
      fromUserId,
      { $pull: { sharedWith: toUserId } },
      { new: true }
    );
    const receiver = await User.findByIdAndUpdate(
      toUserId,
      { $pull: { canAccess: fromUserId } },
      { new: true }
    );
    if (!sharer || !receiver) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.status(200).json({ message: 'Location sharing stopped successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};