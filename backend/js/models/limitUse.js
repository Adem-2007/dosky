// models/limitUse.js

import mongoose from 'mongoose';

const limitUseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  uploadCount: {
    type: Number,
    default: 0,
  },
  // NEW: Field to track chat messages for the current session
  chatMessagesCount: {
    type: Number,
    default: 0,
  },
  lastResetDate: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

const LimitUse = mongoose.model('LimitUse', limitUseSchema);

export default LimitUse;