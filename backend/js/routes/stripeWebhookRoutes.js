// routes/stripeWebhookRoutes.js

import express from 'express';
import Stripe from 'stripe';
import User from '../models/User.js';

const router = express.Router();

let stripe;

const getStripe = () => {
    if (!stripe) {
        if (!process.env.STRIPE_SECRET_KEY) {
            throw new Error('Stripe secret key is not configured.');
        }
        stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2023-10-16',
        });
    }
    return stripe;
};

const backendPlanConfig = {
    'pro_monthly': { dbPlanName: 'Pro', durationMonths: 1 },
    'pro_yearly': { dbPlanName: 'Pro', durationMonths: 12 },
    'premium_monthly': { dbPlanName: 'Premium', durationMonths: 1 },
    'premium_yearly': { dbPlanName: 'Premium', durationMonths: 12 },
};

// Stripe Webhook for fulfilling the purchase
router.post('/', async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        const stripeInstance = getStripe();
        // Use the raw body from the request for verification
        event = stripeInstance.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error(`❌ Webhook signature verification failed.`, err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the payment_intent.succeeded event
    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        const { userId, planId } = paymentIntent.metadata;

        console.log(`✅ Webhook received for user ${userId} and plan ${planId}.`);

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
                console.log(`✅ SUCCESS: User ${userId} subscription updated to ${plan.dbPlanName} via Stripe webhook.`);
            } else {
                 console.error(`❌ CRITICAL: User or Plan not found for webhook. UserID: ${userId}, PlanID: ${planId}`);
            }

        } catch (dbError) {
            console.error('❌ Database update error from webhook:', dbError);
            // Return a 500 to indicate to Stripe that it should retry the webhook
            return res.status(500).json({ status: "failed", message: "Database update error" });
        }
    } else {
        console.log(`- Unhandled event type ${event.type}`);
    }

    // Acknowledge receipt of the event
    res.json({ received: true });
});

export default router;