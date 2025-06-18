import { useEffect, useState } from 'react';
import { useStripe, useElements, CardNumberElement, CardExpiryElement, CardCvcElement } from '@stripe/react-stripe-js';
import PropTypes from 'prop-types';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../src/assets/stripe.css';

const countries = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'ZA', name: 'South Africa' },
];

const CheckoutForm = ({ plan, userId, closeModal }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const [price, setPrice] = useState(plan?.price || 0);
  const [billingDetails, setBillingDetails] = useState({
    fullname: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
  });

  useEffect(() => {
    if (plan?.price) setPrice(plan.price);
  }, [plan]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/auth/user/${userId}`);
        const { firstname, lastname, email } = response.data;
        setBillingDetails(prev => ({
          ...prev,
          fullname: `${firstname} ${lastname}`,
          email,
        }));
      } catch (err) {
        setError('Error fetching user details: ' + (err.response?.data?.message || err.message));
      }
    };

    fetchUserDetails();
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBillingDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setError('Stripe or Elements not loaded');
      return;
    }

    setLoading(true);

    try {
      const { data } = await axios.post('http://localhost:3000/auth/create-payment-intent', {
        plan: plan.planType,
        userId,
      });

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardNumberElement),
          billing_details: {
            name: billingDetails.fullname,
            email: billingDetails.email,
            address: {
              line1: billingDetails.address,
              city: billingDetails.city,
              postal_code: billingDetails.postalCode,
              country: billingDetails.country,
            },
          },
        },
      });

      if (stripeError) {
        setError('Payment failed: ' + stripeError.message);
        setLoading(false);
        return;
      }

      const response = await axios.post('http://localhost:3000/auth/update-status', {
        userId,
        paymentIntentId: paymentIntent.id,
        status: 'paid',
        billingDetails,
      });

      if (response.status === 200) {
        alert('Payment succeeded!');
        closeModal();
        window.location.href = '/dashboard';
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError('Payment failed: ' + msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container min-vh-100 d-flex justify-content-center align-items-center">
      <div className="card shadow p-4 w-100" style={{ maxWidth: '600px' }}>
        <h2 className="mb-4 text-center">Checkout</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="fullname" className="form-label">Full Name</label>
            <input
              type="text"
              name="fullname"
              id="fullname"
              className="form-control"
              value={billingDetails.fullname}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              className="form-control"
              value={billingDetails.email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="address" className="form-label">Address</label>
            <input
              type="text"
              name="address"
              id="address"
              className="form-control"
              value={billingDetails.address}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="city" className="form-label">City</label>
            <input
              type="text"
              name="city"
              id="city"
              className="form-control"
              value={billingDetails.city}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="postalCode" className="form-label">Postal Code</label>
            <input
              type="text"
              name="postalCode"
              id="postalCode"
              className="form-control"
              value={billingDetails.postalCode}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="country" className="form-label">Country</label>
            <select
              name="country"
              id="country"
              className="form-control"
              value={billingDetails.country}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Country</option>
              {countries.map((c) => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label htmlFor="cardNumber" className="form-label">Card Number</label>
            <CardNumberElement id="cardNumber" className="form-control StripeElement" />
          </div>
          <div className="mb-3">
            <label htmlFor="cardExpiry" className="form-label">Card Expiry</label>
            <CardExpiryElement id="cardExpiry" className="form-control StripeElement" />
          </div>
          <div className="mb-3">
            <label htmlFor="cardCvc" className="form-label">Card CVC</label>
            <CardCvcElement id="cardCvc" className="form-control StripeElement" />
          </div>
          <div className="d-flex justify-content-between align-items-center mt-4">
            <p className="m-0">Price: {price === 0 ? "Free" : `R${price / 100} ZAR`}</p>
            <button type="submit" className="btn btn-primary" disabled={!stripe || loading}>
              {loading ? 'Processing...' : 'Pay'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

CheckoutForm.propTypes = {
  plan: PropTypes.object.isRequired,
  userId: PropTypes.string.isRequired,
  closeModal: PropTypes.func.isRequired,
};

export default CheckoutForm;
