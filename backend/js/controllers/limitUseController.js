// controllers/limitUseController.js

import User from '../models/User.js';
import LimitUse from '../models/limitUse.js';

const PLAN_LIMITS = {
  'Starter': 3,
  'Pro': 50,
  'Premium': 500, // Changed from Infinity to 500
};

// Define chat message limits per plan for each uploaded document
const PLAN_CHAT_LIMITS = {
  'Starter': 10,
  'Pro': 200,
  'Premium': Infinity,
};

const getOrCreateUsageRecord = async (userId) => {
  let usage = await LimitUse.findOne({ userId });

  if (!usage) {
    return await LimitUse.create({ userId, uploadCount: 0, lastResetDate: new Date() });
  }

  const now = new Date();
  const lastReset = new Date(usage.lastResetDate);
  const oneMonthInMs = 30 * 24 * 60 * 60 * 1000; 

  if (now - lastReset > oneMonthInMs) {
    usage.uploadCount = 0;
    usage.lastResetDate = now;
    // Also reset chat count on monthly reset, just in case
    usage.chatMessagesCount = 0;
    await usage.save();
  }

  return usage;
};


export const getUploadStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const usage = await getOrCreateUsageRecord(req.user.id);
    const uploadLimit = PLAN_LIMITS[user.subscription.planName] || 0;
    const chatLimit = PLAN_CHAT_LIMITS[user.subscription.planName] || 0;

    res.json({
      uploadCount: usage.uploadCount,
      limit: uploadLimit,
      chatMessagesCount: usage.chatMessagesCount,
      chatLimit: chatLimit,
      planName: user.subscription.planName,
    });
  } catch (error) {
    console.error('Error fetching upload status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


export const incrementUploadCount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const usage = await getOrCreateUsageRecord(req.user.id);
    const limit = PLAN_LIMITS[user.subscription.planName] || 0;

    if (usage.uploadCount >= limit) {
      return res.status(403).json({ message: `Upload limit reached.` });
    }

    usage.uploadCount += 1;
    usage.chatMessagesCount = 0;
    await usage.save();

    res.status(200).json({
      message: 'Upload count incremented and chat session reset.',
      uploadCount: usage.uploadCount,
      chatMessagesCount: usage.chatMessagesCount,
    });

  } catch (error) {
    console.error('Error incrementing upload count:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Increment chat message count for the logged-in user.
 * @route   POST /api/limits/increment-chat
 * @access  Private
 */
export const incrementChatMessageCount = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const usage = await getOrCreateUsageRecord(req.user.id);
        const chatLimit = PLAN_CHAT_LIMITS[user.subscription.planName] || 0;

        if (chatLimit !== Infinity && usage.chatMessagesCount >= chatLimit) {
            return res.status(403).json({ message: `Chat message limit of ${chatLimit} reached.` });
        }

        usage.chatMessagesCount += 1;
        await usage.save();

        res.status(200).json({
            message: 'Chat message count incremented.',
            chatMessagesCount: usage.chatMessagesCount,
            chatLimit: chatLimit,
        });

    } catch (error) {
        console.error('Error incrementing chat message count:', error);
        res.status(500).json({ message: 'Server error' });
    }
};