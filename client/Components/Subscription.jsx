import { useEffect, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import PropTypes from 'prop-types';
import CheckoutForm from './CheckOut';
import { loadStripe } from '@stripe/stripe-js';
import { getCookie } from '../Utils/cookieUtils';
import 'bootstrap/dist/css/bootstrap.min.css';

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
      <div className="modal show d-block" tabIndex="-1" role="dialog">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Subscribe to {plan} Plan</h5>
              <button type="button" className="close" onClick={closeModal} aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <Elements stripe={stripePromise}>
                <CheckoutForm plan={plan} userId={userId} closeModal={closeModal} />
              </Elements>
            </div>
          </div>
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