import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';
import { verificationEmailTemplate } from '../utils/emailTemplates.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

export const register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const verificationCode = crypto.randomInt(100000, 1000000).toString();
    const user = await User.create({ name, email, password, verificationCode });

    const message = verificationEmailTemplate(name, verificationCode);

    try {
      await sendEmail({
        email: user.email,
        subject: 'Your Verification Code',
        message,
      });
      res.status(201).json({
        message: 'Registration successful! Please check your email for a verification code.',
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Email could not be sent. Please try again.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  const { email, verificationCode } = req.body;
  try {
    const user = await User.findOne({ email }).select('+verificationCode');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (user.isVerified) return res.status(400).json({ message: 'Account already verified.' });
    if (user.verificationCode !== verificationCode) return res.status(400).json({ message: 'Invalid verification code.' });

    user.isVerified = true;
    user.verificationCode = undefined;
    await user.save();

    const token = generateToken(user._id);
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
      subscription: user.subscription, // <-- ADDED
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during verification.' });
  }
};

// MODIFIED: Added `subscription` to the response payload
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (!user.isVerified) {
      return res.status(401).json({ message: 'Please verify your email to log in.' });
    }
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
      subscription: user.subscription, // <-- ADDED
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// NEW: Add a protected route to get the current user's profile
export const getUserProfile = async (req, res) => {
    // req.user is populated by the `protect` middleware
    const user = await User.findById(req.user.id);

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            subscription: user.subscription, // <-- Also send subscription here
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};