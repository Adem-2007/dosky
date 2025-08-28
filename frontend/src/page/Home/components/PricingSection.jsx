import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useLocation } from 'wouter';

import PaymentModal from '../../Pricing/components/PaymentModal';
import PaymentSuccessModal from '../../Pricing/components/PaymentSuccessModal';
import PaymentCancelModal from '../../Pricing/components/PaymentCancelModal';

const plans = {
  monthly: [
    { 
      name: 'Starter', 
      price: '$0', 
      popular: false, 
      features: [
        '5 documents/month', 
        '2MB file size limit', 
        '10 messages/document'
      ] 
    },
    { 
      name: 'Pro', 
      price: '$7',
      popular: true, 
      features: [
        '50 documents/month', 
        '32MB file size limit', 
        '200 messages/document'
      ] 
    },
    { 
      name: 'Premium', 
      price: '$13',
      popular: false, 
      features: [
        '500 documents/month', 
        '128MB file size limit', 
        'Unlimited messages/document'
      ] 
    },
  ],
  yearly: [
    { 
      name: 'Starter', 
      price: '$0', 
      popular: false, 
      features: [
        '5 documents/month', 
        '2MB file size limit', 
        '10 messages/document'
      ] 
    },
    { 
      name: 'Pro', 
      price: '$70',
      popular: true, 
      features: [
        '50 documents/month', 
        '32MB file size limit', 
        '200 messages/document'
      ] 
    },
    { 
      name: 'Premium', 
      price: '$130',
      popular: false, 
      features: [
        'Unlimited documents', 
        '128MB file size limit', 
        'Unlimited messages/document'
      ] 
    },
  ],
};

const PricingCard = ({ plan, isYearly, onChoosePlan }) => {
  const isPro = plan.popular;
  
  return (
    <motion.div
      className={`relative p-8 rounded-2xl border flex flex-col ${isPro ? 'border-transparent bg-white shadow-2xl' : 'border-[#0A7C8A]/20 bg-white/50'}`}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      {isPro && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#FF6F61] text-white px-4 py-1 rounded-full text-sm font-semibold">
          Most Popular
        </div>
      )}
      <h3 className="text-xl font-semibold text-[#0A7C8A]">{plan.name}</h3>
      
      <p className="mt-4 text-4xl font-bold text-[#2C3A47]">
        {plan.price}
        <span className="text-base font-normal text-[#2C3A47]/60">
          {plan.price === '$0' ? '' : (isYearly ? '/year' : '/month')}
        </span>
      </p>
      
      <ul className="mt-8 space-y-4 text-[#2C3A47]/80 flex-grow">
        {plan.features.map(feature => (
          <li key={feature} className="flex items-start">
            <Check className="w-5 h-5 text-[#0A7C8A] mr-3 flex-shrink-0 mt-1" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {/* --- MODIFIED: Button is now removed from the Starter plan --- */}
      {plan.name !== 'Starter' && (
        <motion.button
          onClick={() => onChoosePlan(plan)}
          className={`w-full mt-10 py-3 rounded-full font-bold transition-shadow ${isPro ? 'bg-[#0A7C8A] text-white shadow-lg shadow-[#0A7C8A]/30' : 'bg-white border border-[#0A7C8A]/50 text-[#0A7C8A]'}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Choose Plan
        </motion.button>
      )}
    </motion.div>
  );
};


const PricingSection = () => {
  const [isYearly, setIsYearly] = useState(false);
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const currentPlans = isYearly ? plans.yearly : plans.monthly;
  
  const [modalState, setModalState] = useState({
    isOpen: false,
    view: null,
    plan: null,
  });

  // --- MODIFIED: Simplified the function. It now only handles paid plans. ---
  const handleChoosePlan = (plan) => {
    if (!user) {
      setLocation('/auth');
    } else {
      setModalState({ isOpen: true, view: 'payment', plan: plan });
    }
  };
  
  const closeAllModals = () => {
    setModalState({ isOpen: false, view: null, plan: null });
  };

  const handlePaymentSuccess = () => {
    setModalState(prev => ({ ...prev, view: 'success' }));
  };
  
  const handlePaymentCancel = () => {
    setModalState(prev => ({ ...prev, view: 'cancel' }));
  };

  const handleRetry = () => {
    setModalState(prev => ({...prev, view: 'payment' }));
  };

  return (
    <>
      <AnimatePresence>
        {modalState.isOpen && modalState.view === 'payment' && (
          <PaymentModal
            plan={modalState.plan}
            isYearly={isYearly}
            onClose={closeAllModals}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentCancel={handlePaymentCancel}
          />
        )}
        {modalState.isOpen && modalState.view === 'success' && (
          <PaymentSuccessModal
            planName={modalState.plan.name}
            onClose={closeAllModals}
          />
        )}
        {modalState.isOpen && modalState.view === 'cancel' && (
          <PaymentCancelModal
            onClose={closeAllModals}
            onRetry={handleRetry}
          />
        )}
      </AnimatePresence>
      
      <div className="py-24 px-8">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-[#0A7C8A]">Find the Perfect Plan</h2>
          <p className="mt-4 text-lg text-[#2C3A47]/70 max-w-2xl mx-auto">
            Start for free, then upgrade to unlock powerful features that transform your workflow.
          </p>

          <div className="mt-12 flex justify-center items-center gap-4">
            <span className={`font-medium ${!isYearly ? 'text-[#0A7C8A]' : 'text-[#2C3A47]/50'}`}>Monthly</span>
            {/* --- MODIFIED: Added justify-start/justify-end to move the switch handle --- */}
            <div 
              onClick={() => setIsYearly(!isYearly)} 
              className={`w-14 h-8 rounded-full flex items-center p-1 cursor-pointer transition-colors ${isYearly ? 'bg-[#0A7C8A] justify-end' : 'bg-[#0A7C8A]/20 justify-start'}`}
            >
              <motion.div 
                className="w-6 h-6 bg-white rounded-full shadow-md"
                layout
                transition={{ type: 'spring', stiffness: 700, damping: 30 }}
              />
            </div>
            <span className={`font-medium ${isYearly ? 'text-[#0A7C8A]' : 'text-[#2C3A47]/50'}`}>Yearly</span>
            <span className="bg-[#FF6F61]/20 text-[#FF6F61] font-bold text-xs px-2 py-1 rounded-full">SAVE ~15%</span>
          </div>

          <div className="mt-16 grid md:grid-cols-3 gap-8">
            {currentPlans.map(plan => (
              <PricingCard key={plan.name} plan={plan} isYearly={isYearly} onChoosePlan={handleChoosePlan} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default PricingSection;