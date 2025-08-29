import express from 'express';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

// =================================================================
// ===== ENHANCED DEBUGGING CODE ====
// =================================================================
console.log("--- [STARTUP LOG] Verifying PayPal Environment Variables ---");
console.log("PAYPAL_API_BASE_URL:", process.env.PAYPAL_API_BASE_URL);
console.log("PAYPAL_CLIENT_ID loaded:", !!process.env.PAYPAL_CLIENT_ID);
console.log("PAYPAL_CLIENT_SECRET loaded:", !!process.env.PAYPAL_CLIENT_SECRET);
console.log("CLIENT_URL:", process.env.CLIENT_URL);
console.log("BRAND_NAME:", process.env.BRAND_NAME);
console.log("--- [STARTUP LOG] End Verification ---");
// =================================================================

const router = express.Router();

// --- Configuration ---
const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_API_BASE_URL, CLIENT_URL, BRAND_NAME } = process.env;

// Validate required environment variables
if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET || !PAYPAL_API_BASE_URL) {
  console.error("CRITICAL: Missing required PayPal environment variables!");
  process.exit(1);
}

// This config is the secure source of truth.
const backendPlanConfig = {
  'pro_monthly': { dbPlanName: 'Pro', durationMonths: 1, price: '0.01', currency: 'USD' },
  'pro_yearly': { dbPlanName: 'Pro', durationMonths: 12, price: '70.00', currency: 'USD' },
  'premium_monthly': { dbPlanName: 'Premium', durationMonths: 1, price: '13.00', currency: 'USD' },
  'premium_yearly': { dbPlanName: 'Premium', durationMonths: 12, price: '130.00', currency: 'USD' },
};

// --- In-memory cache for PayPal Access Token ---
let paypalAccessTokenCache = { token: null, expiresAt: 0 };
const TOKEN_EXPIRY_BUFFER_MS = 10 * 60 * 1000;

async function getPayPalAccessToken() {
    const now = Date.now();
    if (paypalAccessTokenCache.token && now < (paypalAccessTokenCache.expiresAt - TOKEN_EXPIRY_BUFFER_MS)) {
        console.log("Using cached PayPal access token");
        return paypalAccessTokenCache.token;
    }
    
    console.log("Requesting new PayPal access token...");
    
    try {
        const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
        
        console.log("Making OAuth request to:", `${PAYPAL_API_BASE_URL}/v1/oauth2/token`);
        
        const response = await fetch(`${PAYPAL_API_BASE_URL}/v1/oauth2/token`, {
            method: 'POST',
            headers: { 
                'Authorization': `Basic ${auth}`, 
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            body: 'grant_type=client_credentials'
        });
        
        const data = await response.json();
        
        console.log("OAuth Response Status:", response.status);
        console.log("OAuth Response Headers:", Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
            console.error('PayPal OAuth Error Details:');
            console.error('Status:', response.status);
            console.error('Status Text:', response.statusText);
            console.error('Response Body:', JSON.stringify(data, null, 2));
            throw new Error(`PayPal OAuth Error: ${response.status} - ${data.error_description || data.message || response.statusText}`);
        }
        
        paypalAccessTokenCache = { 
            token: data.access_token, 
            expiresAt: now + (data.expires_in * 1000) 
        };
        
        console.log("Successfully obtained PayPal access token, expires in:", data.expires_in, "seconds");
        return data.access_token;
        
    } catch (error) {
        console.error('Detailed error in getPayPalAccessToken:');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
        paypalAccessTokenCache = { token: null, expiresAt: 0 };
        throw error;
    }
}

// 1. Create PayPal Order
router.post('/create-order', async (req, res, next) => {
  console.log("=== CREATE ORDER REQUEST START ===");
  console.log("Request body:", JSON.stringify(req.body, null, 2));
  console.log("User ID:", req.user?.id);
  
  try {
    const { planId } = req.body;
    const userId = req.user.id;
    
    console.log("Plan ID requested:", planId);
    console.log("Available plans:", Object.keys(backendPlanConfig));
    
    const plan = backendPlanConfig[planId];
    if (!plan) {
      console.error("Invalid plan selected:", planId);
      return res.status(400).json({ message: 'Invalid plan selected.' });
    }
    
    console.log("Plan details:", JSON.stringify(plan, null, 2));

    const accessToken = await getPayPalAccessToken();
    console.log("Access token obtained, length:", accessToken?.length);
    
    const orderPayload = {
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: planId,
        description: `CogniPDF Subscription - ${plan.dbPlanName} Plan`,
        amount: { 
          currency_code: plan.currency, 
          value: plan.price 
        },
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
    
    console.log("Order payload:", JSON.stringify(orderPayload, null, 2));
    console.log("Making request to:", `${PAYPAL_API_BASE_URL}/v2/checkout/orders`);
    
    const response = await fetch(`${PAYPAL_API_BASE_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${accessToken}`, 
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(orderPayload)
    });
    
    console.log("PayPal API Response Status:", response.status);
    console.log("PayPal API Response Headers:", Object.fromEntries(response.headers.entries()));
    
    const orderData = await response.json();
    
    console.log("PayPal API Response Body:", JSON.stringify(orderData, null, 2));
    
    if (!response.ok) {
      console.error("=== PAYPAL ORDER CREATION FAILED ===");
      console.error("Status:", response.status);
      console.error("Status Text:", response.statusText);
      console.error("Error Details:", JSON.stringify(orderData, null, 2));
      
      // Check for specific error patterns
      if (orderData.details) {
        console.error("Detailed errors:");
        orderData.details.forEach((detail, index) => {
          console.error(`Error ${index + 1}:`, detail);
        });
      }
      
      const errorMessage = orderData.details?.[0]?.description || 
                          orderData.message || 
                          `PayPal API Error: ${response.status} - ${response.statusText}`;
      
      return res.status(response.status).json({ 
        message: errorMessage,
        paypalError: orderData 
      });
    }
    
    console.log("=== ORDER CREATED SUCCESSFULLY ===");
    console.log("Order ID:", orderData.id);
    
    res.status(201).json({ orderId: orderData.id });
    
  } catch (error) {
    console.error('=== ERROR IN /create-order ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Check if it's a network error
    if (error.cause) {
      console.error('Error cause:', error.cause);
    }
    
    res.status(500).json({ 
      message: 'Internal server error during order creation',
      error: error.message 
    });
  } finally {
    console.log("=== CREATE ORDER REQUEST END ===");
  }
});

// Capture PayPal Order (Enhanced with better logging)
router.post('/capture-order', async (req, res, next) => {
  console.log("=== CAPTURE ORDER REQUEST START ===");
  console.log("Request body:", JSON.stringify(req.body, null, 2));
  
  try {
    const { orderId } = req.body;
    const userId = req.user.id;
    
    console.log("Capturing order:", orderId, "for user:", userId);
    
    const accessToken = await getPayPalAccessToken();
    
    const response = await fetch(`${PAYPAL_API_BASE_URL}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${accessToken}`, 
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Prefer': 'return=representation'
      }
    });
    
    console.log("Capture Response Status:", response.status);
    
    const captureData = await response.json();
    
    console.log("Capture Response Body:", JSON.stringify(captureData, null, 2));
    
    if (!response.ok) {
      console.error("PayPal Capture Error Response:", JSON.stringify(captureData, null, 2));
      return res.status(response.status).json({ 
        message: captureData.message || 'Failed to capture PayPal order.',
        paypalError: captureData 
      });
    }
    
    const payment = captureData.purchase_units?.[0]?.payments?.captures?.[0];
    const planId = captureData.purchase_units?.[0]?.reference_id;
    const plan = backendPlanConfig[planId];
    
    if (!payment || payment.status !== 'COMPLETED' || !plan) {
      console.error("Payment verification failed:", { payment, planId, plan });
      return res.status(400).json({ message: 'Payment verification failed.' });
    }
    
    if (payment.amount.value !== plan.price || payment.amount.currency_code !== plan.currency) {
        console.error(`CRITICAL: Payment amount mismatch for order ${orderId}.`);
        console.error(`Expected: ${plan.price} ${plan.currency}, Got: ${payment.amount.value} ${payment.amount.currency_code}`);
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
    console.error('=== ERROR IN /capture-order ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({ 
      message: 'Internal server error during order capture',
      error: error.message 
    });
  } finally {
    console.log("=== CAPTURE ORDER REQUEST END ===");
  }
});

export default router;