import express from 'express';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const router = express.Router();

// --- Configuration ---
const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_API_BASE_URL, CLIENT_URL, BRAND_NAME } = process.env;

// This config is the secure source of truth.
const backendPlanConfig = {
  'pro_monthly': {
    dbPlanName: 'Pro',
    durationMonths: 1,
    price: '0.01',
    currency: 'USD',
  },
  'pro_yearly': {
    dbPlanName: 'Pro',
    durationMonths: 12,
    price: '70.00',
    currency: 'USD',
  },
  'premium_monthly': {
    dbPlanName: 'Premium',
    durationMonths: 1,
    price: '13.00',
    currency: 'USD',
  },
  'premium_yearly': {
    dbPlanName: 'Premium',
    durationMonths: 12,
    price: '130.00',
    currency: 'USD',
  },
};

// --- In-memory cache for PayPal Access Token ---
let paypalAccessTokenCache = { token: null, expiresAt: 0 };
const TOKEN_EXPIRY_BUFFER_MS = 10 * 60 * 1000;

async function getPayPalAccessToken() {
    const now = Date.now();
    if (paypalAccessTokenCache.token && now < (paypalAccessTokenCache.expiresAt - TOKEN_EXPIRY_BUFFER_MS)) {
        return paypalAccessTokenCache.token;
    }
    try {
        const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
        const response = await fetch(`${PAYPAL_API_BASE_URL}/v1/oauth2/token`, {
            method: 'POST',
            headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'grant_type=client_credentials'
        });
        const data = await response.json();
        if (!response.ok) {
            // Log detailed error from PayPal if token generation fails
            console.error('PayPal OAuth Error:', JSON.stringify(data, null, 2));
            throw new Error(`PayPal OAuth Error: ${response.statusText}`);
        }
        paypalAccessTokenCache = { token: data.access_token, expiresAt: now + (data.expires_in * 1000) };
        return data.access_token;
    } catch (error) {
        console.error('Failed to get PayPal access token:', error);
        paypalAccessTokenCache = { token: null, expiresAt: 0 };
        throw error;
    }
}

// --- API Routes ---

// 1. Create PayPal Order
router.post('/create-order', async (req, res, next) => {
  try {
    const { planId } = req.body;
    const userId = req.user.id;
    const plan = backendPlanConfig[planId];
    if (!plan) return res.status(400).json({ message: 'Invalid plan selected.' });

    const accessToken = await getPayPalAccessToken();
    const orderPayload = {
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: planId,
        description: `CogniPDF Subscription - ${plan.dbPlanName} Plan`,
        amount: { currency_code: plan.currency, value: plan.price },
        custom_id: `user_${userId}`
      }],
      application_context: {
        return_url: `${CLIENT_URL}/payment-success`,
        cancel_url: `${CLIENT_URL}/pricing`,
        brand_name: BRAND_NAME || 'CogniPDF',
        user_action: 'PAY_NOW',
        shipping_preference: 'NO_SHIPPING'
      }
    };

    const response = await fetch(`${PAYPAL_API_BASE_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    });

    const orderData = await response.json();

    // =================================================================
    // THIS IS THE CORRECTED PART
    // =================================================================
    if (!response.ok) {
      // This will now log the REAL error message from PayPal to your server logs
      console.error("PayPal API Error Response:", JSON.stringify(orderData, null, 2));
      throw new Error(orderData.message || 'Failed to create PayPal order.');
    }
    
    res.status(201).json({ orderId: orderData.id });
  } catch (error) {
    console.error('Error in /create-order:', error);
    next(error);
  }
});

// 2. Capture PayPal Order
router.post('/capture-order', async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const userId = req.user.id;
    const accessToken = await getPayPalAccessToken();

    const response = await fetch(`${PAYPAL_API_BASE_URL}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' }
    });

    const captureData = await response.json();

    if (!response.ok) {
      // Added detailed logging here as well, just in case
      console.error("PayPal Capture Error Response:", JSON.stringify(captureData, null, 2));
      throw new Error(captureData.message || 'Failed to capture PayPal order.');
    }

    const payment = captureData.purchase_units?.[0]?.payments?.captures?.[0];
    const planId = captureData.purchase_units?.[0]?.reference_id;
    const plan = backendPlanConfig[planId];

    if (!payment || payment.status !== 'COMPLETED' || !plan) {
      return res.status(400).json({ message: 'Payment verification failed.' });
    }

    if (payment.amount.value !== plan.price || payment.amount.currency_code !== plan.currency) {
        console.error(`CRITICAL: Payment amount mismatch for order ${orderId}.`);
        return res.status(400).json({ message: 'Payment amount mismatch. Please contact support.' });
    }

    const user = await User.findById(userId);
    if (!user) {
        console.error(`CRITICAL: User not found (ID: ${userId}) for captured order ${orderId}.`);
        return res.status(404).json({ message: 'User account not found. Please contact support.' });
    }

    const now = new Date();
    const endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + plan.durationMonths);

    user.subscription = {
      planName: plan.dbPlanName,
      status: 'active',
      paymentProcessor: 'paypal',
      paypalOrderId: orderId,
      startDate: now,
      endDate: endDate,
      lastPaymentDate: now
    };

    await user.save();
    console.log(`User ${userId} subscription updated to ${plan.dbPlanName} until ${endDate.toISOString()}`);
    res.json({ success: true, message: 'Payment successful and subscription updated!' });
  } catch (error) {
    console.error('Error in /capture-order:', error);
    next(error);
  }
});

export default router;