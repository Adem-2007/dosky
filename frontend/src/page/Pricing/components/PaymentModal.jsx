// src/page/Pricing/components/PaymentModal.jsx (Refactored for Optimistic UI & Redesigned)

import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { motion } from 'framer-motion';
import { X, Loader2, ShieldCheck, Lock, PartyPopper, CreditCard, CheckCircle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const cardElementOptions = {
  style: {
    base: { color: "#32325d", fontFamily: '"Helvetica Neue", Helvetica, sans-serif', fontSmoothing: "antialiased", fontSize: "16px", "::placeholder": { color: "#aab7c4" } },
    invalid: { color: "#fa755a", iconColor: "#fa755a" }
  }
};

const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2, ease: 'easeIn' } },
};

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({ plan, isYearly, onClose, onPaymentSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();
    const { user, login } = useAuth(); // Replaced refreshUser with login for optimistic update

    const [processing, setProcessing] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [error, setError] = useState(null);
    const [paymentSucceeded, setPaymentSucceeded] = useState(false);

    const price = parseFloat(plan.price.replace('$', ''));
    const finalPrice = isYearly ? (price * 12 * 0.8) : price;
    const priceString = `$${finalPrice.toFixed(isYearly ? 0 : 2)}`;
    const intervalString = isYearly ? 'year' : 'month';

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!stripe || !elements) return;

        setProcessing(true);
        setStatusMessage('Processing payment...');
        setError(null);

        try {
            const storedUserString = localStorage.getItem('user') || sessionStorage.getItem('user');
            if (!storedUserString) throw new Error('Authentication error. Please log in again.');
            
            const storedUser = JSON.parse(storedUserString);
            if (!storedUser?.token) throw new Error('Authentication token not found. Please log in again.');

            const planNameSlug = plan.name.toLowerCase();
            const planId = `${planNameSlug}_${isYearly ? 'yearly' : 'monthly'}`;
            const apiUrl = `${import.meta.env.VITE_API_URL}/api/stripe/create-payment-intent`;

            // 1. Create Payment Intent on the server
            const res = await fetch(apiUrl, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
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

            // --- KEY CHANGE: THE OPTIMISTIC UI LOGIC ---
            if (paymentIntent.status === "succeeded") {
                setStatusMessage(`Success! Your ${plan.name} plan is now active.`);
                
                // 1. Construct the new user object optimistically.
                // This assumes what the backend *will* look like after the webhook.
                const optimisticSubscription = {
                    planName: plan.name,
                    status: 'active',
                    paymentProcessor: 'stripe',
                    stripePaymentIntentId: paymentIntent.id,
                    startDate: new Date().toISOString(),
                    // We can approximate the end date on the client
                    endDate: new Date(new Date().setMonth(new Date().getMonth() + (isYearly ? 12 : 1))).toISOString(),
                    lastPaymentDate: new Date().toISOString()
                };

                const optimisticUser = {
                    ...user,
                    subscription: optimisticSubscription,
                };
                
                // 2. Immediately update the global AuthContext state.
                // The UI across the entire app will now reflect the new subscription.
                const wasRemembered = !!localStorage.getItem('user');
                login(optimisticUser, wasRemembered);

                // 3. Trigger the success animation and close the modal. NO POLLING.
                setPaymentSucceeded(true);
                setTimeout(() => onPaymentSuccess(), 2500);

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

    if (paymentSucceeded) {
        return (
            <div className="p-8 text-center bg-white">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1, transition: { type: 'spring', stiffness: 260, damping: 20 } }}>
                    <PartyPopper className="w-20 h-20 mx-auto text-teal-500" />
                </motion.div>
                <h2 className="text-3xl font-bold text-gray-800 mt-4">Thank You!</h2>
                <p className="text-gray-600 mt-2 text-lg">{statusMessage}</p>
                <p className="text-sm text-gray-500 mt-4">You can now access all the premium features. The modal will close automatically.</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2">
            {/* Left Side: Order Summary */}
            <div className="p-8 bg-slate-50 border-r border-slate-200">
                <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Order Summary</h2>
                <div className="mt-6 bg-white border border-slate-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                        <p className="text-gray-600">Plan</p>
                        <p className="font-bold text-teal-600">{plan.name} ({isYearly ? 'Yearly' : 'Monthly'})</p>
                    </div>
                    <hr className="my-3"/>
                    <div className="flex justify-between items-center text-lg">
                        <p className="text-gray-800 font-semibold">Total Due Today</p>
                        <p className="font-bold text-gray-900">{priceString}</p>
                    </div>
                </div>
                <div className="mt-6 text-sm text-gray-500 space-y-3">
                    <div className="flex items-center">
                        <CheckCircle size={16} className="mr-2 text-teal-500 flex-shrink-0" />
                        <span>Cancel anytime, no questions asked.</span>
                    </div>
                    <div className="flex items-center">
                        <ShieldCheck size={16} className="mr-2 text-teal-500 flex-shrink-0" />
                        <span>Secure SSL encrypted payment.</span>
                    </div>
                </div>
            </div>

            {/* Right Side: Payment Form */}
            <div className="p-8 bg-white">
                 <h3 className="text-lg font-semibold text-gray-700 flex items-center"><CreditCard size={20} className="mr-2 text-gray-500"/>Card Details</h3>
                 <div className="mt-4 p-3 bg-white rounded-lg border border-gray-300 shadow-inner focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/50 transition">
                    <CardElement options={cardElementOptions} />
                 </div>
            
                {error && <div className="mt-4 text-center text-sm text-red-500 font-medium">{error}</div>}

                <motion.button
                    type="submit"
                    disabled={!stripe || processing}
                    whileHover={{ scale: processing ? 1 : 1.02 }}
                    whileTap={{ scale: processing ? 1 : 0.98 }}
                    className="mt-8 w-full bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold py-3.5 rounded-lg flex items-center justify-center space-x-2 relative overflow-hidden shadow-lg shadow-teal-500/30 disabled:from-gray-400 disabled:to-gray-500 disabled:shadow-none transition-all duration-300 text-lg"
                >
                    {processing ? (
                        <>
                            <Loader2 className="animate-spin h-5 w-5 mr-2" />
                            <span>{statusMessage || 'Processing...'}</span>
                        </>
                    ) : (
                        <>
                            <Lock size={18} />
                            <span>Pay {priceString} Securely</span>
                        </>
                    )}
                </motion.button>
                <div className="mt-4 text-center text-xs text-gray-400 flex items-center justify-center">
                    <ShieldCheck size={14} className="mr-2 text-gray-500"/> Payments processed securely by Stripe.
                </div>
            </div>
        </form>
    );
};

const PaymentModal = (props) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <motion.div
      variants={modalVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="relative bg-white border border-gray-200 rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden"
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