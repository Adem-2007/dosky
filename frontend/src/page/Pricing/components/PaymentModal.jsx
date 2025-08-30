// src/page/Pricing/components/PaymentModal.jsx (New Stripe Version)

import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { motion } from 'framer-motion';
import { X, Loader2, ShieldCheck, Lock } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

// --- Stripe's recommended styling for the CardElement ---
const cardElementOptions = {
  style: {
    base: {
      color: "#32325d",
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": {
        color: "#aab7c4"
      }
    },
    invalid: {
      color: "#fa755a",
      iconColor: "#fa755a"
    }
  }
};

const modalVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 50 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 1, 0.5, 1] } },
    exit: { opacity: 0, scale: 0.9, y: 50, transition: { duration: 0.3, ease: 'easeIn' } },
};

// --- Stripe Publishable Key ---
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({ plan, isYearly, onClose, onPaymentSuccess, onPaymentCancel }) => {
    const stripe = useStripe();
    const elements = useElements();
    const { user, refreshUser } = useAuth();

    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);

    const priceString = isYearly ? `$${(parseFloat(plan.price.replace('$', '')) * 12 * 0.8).toFixed(0)}` : plan.price;

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!stripe || !elements) return;

        setProcessing(true);
        setError(null);

        try {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            if (!storedUser?.token) throw new Error('Authentication error. Please log in again.');

            const planNameSlug = plan.name.toLowerCase();
            const planId = `${planNameSlug}_${isYearly ? 'yearly' : 'monthly'}`;
            const apiUrl = `${import.meta.env.VITE_API_URL}/api/stripe/create-payment-intent`;

            // 1. Create Payment Intent on the server
            const res = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${storedUser.token}` },
                body: JSON.stringify({ planId }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Failed to initialize payment.");
            }
            
            const { clientSecret } = await res.json();

            // 2. Confirm the payment on the client
            const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                    billing_details: { email: user.email, name: user.name },
                },
            });

            if (stripeError) {
                throw new Error(stripeError.message);
            }

            if (paymentIntent.status === "succeeded") {
                await refreshUser();
                onPaymentSuccess();
            } else {
                 throw new Error("Payment was not successful. Please try again.");
            }

        } catch (err) {
            console.error("Payment failed:", err);
            setError(err.message);
            setProcessing(false);
            // Optional: call onPaymentCancel() after a short delay if you want to show the error first
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Complete Your Purchase</h2>
            <div className="mt-6 p-5 bg-white/70 rounded-lg border border-gray-200/80 space-y-4">
                <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-600">Plan</span>
                    <span className="font-bold text-lg text-teal-700 bg-teal-100/80 px-3 py-1 rounded-md">{plan.name}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-600">Total</span>
                    <span className="font-bold text-2xl text-gray-800">{priceString}<span className="text-base font-normal text-gray-500">/{isYearly ? 'year' : 'month'}</span></span>
                </div>
            </div>
            
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
                className="mt-8 w-full bg-[#0D9488] text-white font-bold py-3 rounded-lg flex items-center justify-center space-x-2 relative overflow-hidden shadow-lg shadow-teal-500/20 disabled:bg-gray-400 disabled:shadow-none"
                whileHover={{ scale: 1.05, boxShadow: '0px 10px 30px rgba(13, 148, 136, 0.25)' }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 300 }}
            >
                {processing ? (
                    <Loader2 className="animate-spin h-6 w-6" />
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