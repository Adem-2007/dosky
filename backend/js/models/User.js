// models/User.js

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const subscriptionSchema = new mongoose.Schema({
  planName: {
    type: String,
    enum: ['Starter', 'Pro', 'Premium'],
    default: 'Starter'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'cancelled'],
    default: 'inactive'
  },
  paymentProcessor: {
    type: String,
    enum: ['paypal', 'stripe'],
  },
  stripePaymentIntentId: {
    type: String
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  lastPaymentDate: {
    type: Date
  },
}, { _id: false });


const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationCode: {
    type: String,
    select: false
  },
  subscription: {
    type: subscriptionSchema,
    default: () => ({})
  }
}, {
  timestamps: true
});


userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;