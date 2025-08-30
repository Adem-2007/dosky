// routes/stripeRoutes.js (Corrected - Webhook Removed)

import express from 'express';
import Stripe from 'stripe';
import User from '../models/User.js';

const router = express.Router();

let stripe;

const getStripe = () => {
    if (!stripe) {
        if (!process.env.STRIPE_SECRET_KEY) {
            console.error('CRITICAL: Stripe secret key is not configured.');
            throw new Error('Stripe secret key is not configured.');
        }
        stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2023-10-16',
        });
        console.log("Stripe instance initialized successfully on first use.");
    }
    return stripe;
};

// Note: The plan prices are illustrative. Ensure they match your Stripe products.
const backendPlanConfig = {
    'pro_monthly': { dbPlanName: 'Pro', price: '0.6', currency: 'EUR' },
    'pro_yearly': { dbPlanName: 'Pro', price: '70.00', currency: 'USD' },
    'premium_monthly': { dbPlanName: 'Premium', price: '13.00', currency: 'USD' },
    'premium_yearly': { dbPlanName: 'Premium', price: '130.00', currency: 'USD' },
};

// Create a Payment Intent
router.post('/create-payment-intent', async (req, res, next) => {
    try {
        const stripeInstance = getStripe();
        const { planId } = req.body; // This requires a parsed JSON body
        const userId = req.user.id; // This comes from the 'protect' middleware
        const plan = backendPlanConfig[planId];

        if (!plan) {
            return res.status(400).json({ message: 'Invalid plan selected.' });
        }

        const amountInCents = Math.round(parseFloat(plan.price) * 100);

        const paymentIntent = await stripeInstance.paymentIntents.create({
            amount: amountInCents,
            currency: plan.currency.toLowerCase(),
            metadata: {
                userId: userId,
                planId: planId,
            },
        });

        res.send({
            clientSecret: paymentIntent.client_secret,
        });

    } catch (error) {
        console.error('Error creating payment intent:', error);
        next(error);
    }
});

// NOTE: The '/webhook' handler has been moved to its own file.

export default router;