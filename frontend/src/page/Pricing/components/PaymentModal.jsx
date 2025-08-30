// src/page/Pricing/components/PaymentModal.jsx (Fully Corrected with Polling)

import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { motion } from 'framer-motion';
import { X, Loader2, ShieldCheck, Lock, PartyPopper } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const cardElementOptions = {
  style: {
    base: { color: "#32325d", fontFamily: '"Helvetica Neue", Helvetica, sans-serif', fontSmoothing: "antialiased", fontSize: "16px", "::placeholder": { color: "#aab7c4" } },
    invalid: { color: "#fa755a", iconColor: "#fa755a" }
  }
};

const modalVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 50 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 1, 0.5, 1] } },
    exit: { opacity: 0, scale: 0.9, y: 50, transition: { duration: 0.3, ease: 'easeIn' } },
};

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({ plan, isYearly, onClose, onPaymentSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();
    const { user, refreshUser } = useAuth();

    const [processing, setProcessing] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [error, setError] = useState(null);
    const [paymentSucceeded, setPaymentSucceeded] = useState(false);

    const priceString = isYearly ? `$${(parseFloat(plan.price.replace('$', '')) * 12 * 0.8).toFixed(0)}` : plan.price;

    /**
     * This function repeatedly calls `refreshUser` until the user's plan name
     * matches the one they just paid for. This solves the race condition.
     * @param {string} targetPlanName - The name of the plan to wait for (e.g., "Pro").
     * @returns {Promise<boolean>} - True if the update was confirmed, false if it timed out.
     */
    const pollForSubscriptionUpdate = (targetPlanName) => {
      return new Promise((resolve) => {
        let attempts = 0;
        const interval = setInterval(async () => {
          attempts++;
          console.log(`Polling for subscription update... Attempt ${attempts}`);
          
          const updatedUser = await refreshUser(); // This function now returns the latest user data

          // Check if the user object in our context now has the correct, updated plan name
          if (updatedUser?.subscription?.planName === targetPlanName) {
            clearInterval(interval);
            resolve(true); // Success! The webhook has updated the database.
          }

          // Stop after 15 attempts (30 seconds) to prevent an infinite loop
          if (attempts >= 15) {
            clearInterval(interval);
            resolve(false); // Failed to confirm in a reasonable time
          }
        }, 2000); // Poll every 2 seconds
      });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!stripe || !elements) return;

        setProcessing(true);
        setStatusMessage('Processing payment...');
        setError(null);

        try {
            // =================================================================
            // --- START OF CORRECTION ---
            // =================================================================
            // 1. Check BOTH localStorage and sessionStorage for the user data string.
            const storedUserString = localStorage.getItem('user') || sessionStorage.getItem('user');

            // 2. If no user data is found in either storage, the user is not logged in.
            if (!storedUserString) {
                throw new Error('Authentication error. Please log in again.');
            }
            
            // 3. Parse the found user data and ensure it contains a token.
            const storedUser = JSON.parse(storedUserString);
            if (!storedUser?.token) {
                throw new Error('Authentication token not found. Please log in again.');
            }
            // =================================================================
            // --- END OF CORRECTION ---
            // =================================================================

            const planNameSlug = plan.name.toLowerCase();
            const planId = `${planNameSlug}_${isYearly ? 'yearly' : 'monthly'}`;
            const apiUrl = `${import.meta.env.VITE_API_URL}/api/stripe/create-payment-intent`;

            // 1. Create Payment Intent on the server
            const res = await fetch(apiUrl, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    // Use the token that was successfully retrieved from storage
                    'Authorization': `Bearer ${storedUser.token}` 
                },
                body: JSON.stringify({ planId }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Failed to initialize payment.");
            }
            
            const { clientSecret } = await res.json();

            // 2. Confirm the payment on the client
            const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: { card: elements.getElement(CardElement), billing_details: { email: user.email, name: user.name } },
            });

            if (stripeError) throw new Error(stripeError.message);

            if (paymentIntent.status === "succeeded") {
                setStatusMessage('Payment successful! Verifying your new plan...');
                
                // 3. CRITICAL STEP: Poll for the update instead of a single refresh
                const isUpdated = await pollForSubscriptionUpdate(plan.name);

                if (isUpdated) {
                  setPaymentSucceeded(true);
                  setStatusMessage(`Success! Your ${plan.name} plan is now active.`);
                  // Call the success callback after a short delay to show the success message
                  setTimeout(() => { onPaymentSuccess(); }, 2500);
                } else {
                  throw new Error("We couldn't confirm your subscription update automatically. Please refresh the page or contact support.");
                }

            } else {
                 throw new Error("Payment was not successful. Please try again.");
            }

        } catch (err) {
            console.error("Payment failed:", err);
            setError(err.message);
            setProcessing(false);
            setStatusMessage('');
        }
    };

    // Render a success view after payment is finalized
    if (paymentSucceeded) {
        return (
            <div className="p-8 text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1, transition: { type: 'spring', stiffness: 260, damping: 20 } }}>
                    <PartyPopper className="w-16 h-16 mx-auto text-green-500" />
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-800 mt-4">Thank You!</h2>
                <p className="text-gray-600 mt-2">{statusMessage}</p>
                <p className="text-sm text-gray-500 mt-4">The modal will close automatically.</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Complete Your Purchase</h2>
            <p className="text-gray-500 mt-2">You are subscribing to the <span className="font-bold text-teal-600">{plan.name} ({isYearly ? 'Yearly' : 'Monthly'})</span> plan for <span className="font-bold text-gray-800">{priceString}</span>.</p>

            <div className="mt-6">
                 <label className="text-sm font-semibold text-gray-600 mb-2 block">Card Details</label>
                 <div className="p-3 bg-white rounded-lg border border-gray-300 shadow-inner">
                    <CardElement options={cardElementOptions} />
                 </div>
            </div>

            {error && <div className="mt-4 text-center text-sm text-red-500 font-medium">{error}</div>}

            <motion.button
                type="submit"
                disabled={!stripe || processing}
                whileHover={{ scale: processing ? 1 : 1.02 }}
                whileTap={{ scale: processing ? 1 : 0.98 }}
                className="mt-8 w-full bg-[#0D9488] text-white font-bold py-3 rounded-lg flex items-center justify-center space-x-2 relative overflow-hidden shadow-lg shadow-teal-500/20 disabled:bg-gray-400 disabled:shadow-none transition-all duration-300"
            >
                {processing ? (
                    <>
                        <Loader2 className="animate-spin h-5 w-5 mr-2" />
                        <span>{statusMessage}</span>
                    </>
                ) : (
                    <>
                        <Lock size={18} />
                        <span>Pay Securely</span>
                    </>
                )}
            </motion.button>
             <div className="mt-4 text-center text-xs text-gray-400 flex items-center justify-center">
                <ShieldCheck size={14} className="mr-2 text-gray-500"/> Payments processed securely by Stripe.
            </div>
        </form>
    );
};

const PaymentModal = (props) => (
  <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <motion.div
      variants={modalVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="relative bg-[#F9F7F5] border border-gray-200 rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
    >
      <button onClick={props.onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors z-20">
        <X size={24} />
      </button>
      <Elements stripe={stripePromise}>
        <CheckoutForm {...props} />
      </Elements>
    </motion.div>
  </div>
);

export default PaymentModal;