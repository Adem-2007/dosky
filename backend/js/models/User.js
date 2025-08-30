// models/User.js

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * Defines the sub-schema for a user's subscription details.
 * This schema is embedded within the main user document.
 */
const subscriptionSchema = new mongoose.Schema({
  planName: {
    type: String,
    enum: ['Starter', 'Pro', 'Premium'], // The available subscription plans
    default: 'Starter'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'cancelled'], // The current status of the subscription
    default: 'inactive'
  },
  paymentProcessor: {
    type: String,
    enum: ['paypal', 'stripe'], // The payment gateway used for the subscription
  },
  /**
   * CORRECTED: Replaced 'paypalOrderId' with 'stripePaymentIntentId'.
   * This field will store the unique ID of the successful Stripe Payment Intent,
   * which serves as a receipt and reference for the transaction that activated
   * the subscription.
   */
  stripePaymentIntentId: {
    type: String
  },
  startDate: {
    type: Date // The date the subscription became active
  },
  endDate: {
    type: Date // The date the subscription is set to expire
  },
  lastPaymentDate: {
    type: Date // The date of the most recent successful payment
  },
}, { _id: false }); // '_id: false' prevents Mongoose from creating a separate ID for the sub-document


/**
 * Defines the main schema for a user.
 */
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true // Ensures no two users can register with the same email
  },
  password: {
    type: String,
    required: true,
    select: false // Prevents the password from being returned in queries by default
  },
  isVerified: {
    type: Boolean,
    default: false // Tracks if the user has verified their email address
  },
  verificationCode: {
    type: String,
    select: false // Prevents the code from being returned in queries
  },
  subscription: {
    type: subscriptionSchema,
    default: () => ({}) // Sets a default empty subscription object for new users
  }
}, {
  timestamps: true // Automatically adds 'createdAt' and 'updatedAt' fields
});


/**
 * Mongoose middleware (pre-save hook) that automatically hashes the user's password
 * before it is saved to the database, but only if the password has been modified.
 */
userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) {
    return next();
  }

  // Generate a salt and hash the password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * A method on the user model to compare an entered password with the hashed
 * password stored in the database.
 * @param {string} enteredPassword - The plain-text password to compare.
 * @returns {Promise<boolean>} - A promise that resolves to true if the passwords match, false otherwise.
 */
userSchema.methods.comparePassword = async function (enteredPassword) {
  // 'this.password' refers to the user's hashed password, which we can access here
  // even though 'select' is false, because this is a method of the document itself.
  return await bcrypt.compare(enteredPassword, this.password);
};


// Create and export the User model from the schema
const User = mongoose.model('User', userSchema);
export default User;