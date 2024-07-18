import React, { useEffect, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import PropTypes from 'prop-types';
import CheckoutForm from './CheckOut';
import CheckoutFormUpgrade from './SubscriptionDetails';
import { loadStripe } from '@stripe/stripe-js';
import { getCookie } from '../Utils/cookieUtils';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const Subscription = ({ plan, closeModal }) => {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const token = getCookie('token') || sessionStorage.getItem('authToken');
    if (token) {
      setUserId(token);
    }
  }, []);

  return (
    plan ? (
      <div className="modal">
        <div className="modal-content">
          <span className="close" onClick={closeModal}>&times;</span>
          <h1>Subscribe to {plan} Plan</h1>
          <Elements stripe={stripePromise}>
            <CheckoutForm plan={plan} userId={userId} closeModal={closeModal} />
            <CheckoutFormUpgrade plan={plan} userId={userId} closeModal={closeModal} />
          </Elements>
        </div>
      </div>
    ) : null
  );
};

Subscription.propTypes = {
  plan: PropTypes.string.isRequired,
  closeModal: PropTypes.func.isRequired,
};

export default Subscription;
