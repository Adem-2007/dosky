// routes/stripeRoutes.js (Corrected with Lazy Initialization)

import express from 'express';
import Stripe from 'stripe';
import User from '../models/User.js';

const router = express.Router();

// --- CHANGE 1: LAZY INITIALIZATION ---
// We declare 'stripe' here but we DO NOT initialize it yet.
let stripe;

// This function will initialize Stripe only when it's first needed.
const getStripe = () => {
    // If the stripe object hasn't been created yet...
    if (!stripe) {
        // ...then we create it.
        // This code now runs safely AFTER the app has started and the .env is loaded.
        if (!process.env.STRIPE_SECRET_KEY) {
            // We now throw a proper error instead of crashing the whole app with process.exit()
            console.error('CRITICAL: Stripe secret key is not configured.');
            throw new Error('Stripe secret key is not configured.');
        }
        stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2023-10-16',
        });
        console.log("Stripe instance initialized successfully on first use.");
    }
    // Return the single, initialized instance.
    return stripe;
};
// ------------------------------------

const backendPlanConfig = {
    'pro_monthly': { dbPlanName: 'Pro', durationMonths: 1, price: '9.00', currency: 'USD' },
    'pro_yearly': { dbPlanName: 'Pro', durationMonths: 12, price: '70.00', currency: 'USD' },
    'premium_monthly': { dbPlanName: 'Premium', durationMonths: 1, price: '13.00', currency: 'USD' },
    'premium_yearly': { dbPlanName: 'Premium', durationMonths: 12, price: '130.00', currency: 'USD' },
};

// 1. Create a Payment Intent
router.post('/create-payment-intent', async (req, res, next) => {
    try {
        // --- CHANGE 2: USE THE GETTER FUNCTION ---
        // We now call getStripe() to get the instance.
        const stripeInstance = getStripe();
        const { planId } = req.body;
        const userId = req.user.id;
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

// 2. Stripe Webhook for fulfilling the purchase
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        // --- CHANGE 3: USE THE GETTER FUNCTION HERE TOO ---
        const stripeInstance = getStripe();
        event = stripeInstance.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error(`Webhook signature verification failed.`, err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        const { userId, planId } = paymentIntent.metadata;

        try {
            const plan = backendPlanConfig[planId];
            const user = await User.findById(userId);

            if (user && plan) {
                const now = new Date();
                const endDate = new Date(now);
                endDate.setMonth(endDate.getMonth() + plan.durationMonths);

                user.subscription = {
                    planName: plan.dbPlanName,
                    status: 'active',
                    paymentProcessor: 'stripe',
                    stripePaymentIntentId: paymentIntent.id,
                    startDate: now,
                    endDate: endDate,
                    lastPaymentDate: now
                };

                await user.save();
                console.log(`SUCCESS: User ${userId} subscription updated to ${plan.dbPlanName} via Stripe webhook.`);
            } else {
                 console.error(`CRITICAL: User or Plan not found for webhook. UserID: ${userId}, PlanID: ${planId}`);
            }

        } catch (dbError) {
            console.error('Database update error from webhook:', dbError);
            return res.status(500).json({ status: "failed", message: "Database update error" });
        }
    } else {
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
});

export default router;