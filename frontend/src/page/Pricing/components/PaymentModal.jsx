// src/page/Pricing/components/PaymentModal.jsx
// (This is the new, improved version)

import React, { useState } from 'react';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const modalVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 50 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 1, 0.5, 1] } },
  exit: { opacity: 0, scale: 0.9, y: 50, transition: { duration: 0.3, ease: 'easeIn' } },
};

const PaymentModal = ({ plan, isYearly, onClose, onPaymentSuccess, onPaymentCancel }) => {
  const { user, refreshUser } = useAuth();
  const [{ isPending }] = usePayPalScriptReducer();
  const [error, setError] = useState(null);
  const [view, setView] = useState('confirm'); // 'confirm' | 'pay'

  const priceString = isYearly ? `$${(parseFloat(plan.price.replace('$', '')) * 12 * 0.8).toFixed(0)}` : plan.price;

  const createOrder = async (data, actions) => {
    // ... (Your existing createOrder logic remains the same)
    setError(null);
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (!storedUser?.token) throw new Error('Authentication error. Please log in again.');

      const planNameSlug = plan.name.toLowerCase();
      const planId = `${planNameSlug}_${isYearly ? 'yearly' : 'monthly'}`;

      const response = await fetch('http://localhost:5000/api/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${storedUser.token}` },
        body: JSON.stringify({ planId }),
      });
      const order = await response.json();
      if (!response.ok) throw new Error(order.message || 'Failed to create PayPal order.');
      return order.orderId;
    } catch (err) {
      console.error('Create Order Error:', err);
      setError(err.message);
      return null;
    }
  };

  const onApprove = async (data, actions) => {
    // ... (Your existing onApprove logic remains the same)
    setError(null);
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (!storedUser?.token) throw new Error('Authentication error.');

      const response = await fetch('http://localhost:5000/api/paypal/capture-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${storedUser.token}` },
        body: JSON.stringify({ orderId: data.orderID }),
      });
      const details = await response.json();
      if (!response.ok) throw new Error(details.message || "Failed to finalize payment.");
      
      await refreshUser();
      onPaymentSuccess(); // Trigger success modal
    } catch (err) {
      console.error('Approve Order Error:', err);
      setError('An error occurred while processing your payment.');
      onPaymentCancel(); // Trigger cancel/error modal
    }
  };
  
  const onError = (err) => {
    console.error("PayPal Button Error:", err);
    setError("An unexpected error occurred with PayPal.");
    onPaymentCancel(); // Trigger cancel/error modal
  };

  return (
    <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="relative bg-[#F9F7F5] border border-gray-200 rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors z-20">
          <X size={24} />
        </button>

        <div className="p-8">
            <AnimatePresence mode="wait">
                {view === 'confirm' && (
                    <motion.div
                        key="confirm"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        transition={{ duration: 0.4, ease: 'easeInOut' }}
                    >
                        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Review Your Order</h2>
                        <p className="text-gray-500 mt-1">Confirm the details before proceeding.</p>

                        <div className="mt-6 p-5 bg-white/70 rounded-lg border border-gray-200/80 space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-gray-600">Plan</span>
                                <span className="font-bold text-lg text-teal-700 bg-teal-100/80 px-3 py-1 rounded-md">{plan.name}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-gray-600">Total</span>
                                <span className="font-bold text-2xl text-gray-800">{priceString}<span className="text-base font-normal text-gray-500">/{isYearly ? 'year' : 'month'}</span></span>
                            </div>
                            <div className="pt-3 border-t border-gray-200 text-center text-sm text-gray-500">
                                You are purchasing as <strong className="text-teal-600">{user?.email}</strong>.
                            </div>
                        </div>

                        <motion.button
                            onClick={() => setView('pay')}
                            className="mt-8 w-full bg-[#0D9488] text-white font-bold py-3 rounded-lg flex items-center justify-center space-x-2 relative overflow-hidden shadow-lg shadow-teal-500/20"
                            whileHover={{ scale: 1.05, boxShadow: '0px 10px 30px rgba(13, 148, 136, 0.25)' }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                        >
                            <ShieldCheck size={20} />
                            <span>Proceed to Secure Gateway</span>
                        </motion.button>
                    </motion.div>
                )}

                {view === 'pay' && (
                     <motion.div
                        key="pay"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.4, ease: 'easeInOut' }}
                    >
                        <div className="flex items-center space-x-3">
                            <button onClick={() => setView('confirm')} className="text-gray-500 hover:text-gray-800 transition-colors">
                                <ArrowLeft size={22} />
                            </button>
                            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Secure Payment</h2>
                        </div>
                        <p className="text-gray-500 mt-1 ml-9">Finalize your payment via PayPal.</p>
                        
                        <div className="mt-6 min-h-[150px]">
                            {isPending && (
                            <div className="flex flex-col items-center justify-center text-gray-500 space-y-2">
                                <Loader2 className="animate-spin h-10 w-10 text-[#0D9488]" />
                                <span>Connecting to Gateway...</span>
                            </div>
                            )}
                            
                            <div className={`${isPending ? 'opacity-0' : 'opacity-100'}`}>
                                <PayPalButtons
                                    style={{ layout: "vertical", color: "white", shape: "rect", label: "pay" }}
                                    disabled={isPending}
                                    forceReRender={[plan.price]}
                                    createOrder={createOrder}
                                    onApprove={onApprove}
                                    onError={onError}
                                />
                            </div>
                        </div>
                        {error && <div className="mt-4 text-center text-sm text-red-500 font-medium">{error}</div>}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentModal;