import { useEffect, useState } from 'react';
import { useStripe, useElements, CardNumberElement, CardExpiryElement, CardCvcElement } from '@stripe/react-stripe-js';
import PropTypes from 'prop-types';
import axios from 'axios';
import '../src/assets/Checkout.css';

const countries = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'ZA', name: 'South Africa' },
];

const CheckoutForm = ({ plan, userId={userId}, closeModal={closeModal} }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [price, setPrice] = useState(plan?.price || 0);
  const Id = sessionStorage.getItem('userId');
  const [billingDetails, setBillingDetails] = useState({
    fullname: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
  });
  console.log("userId", Id)
  console.log("fhfhhg", price)

  useEffect(() => {
    if (plan?.price) {
      setPrice(plan.price);
    }
  }, [plan]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      console.log('userId received in CheckoutForm:', Id);

      try {
        const response = await axios.get(`http://localhost:3000/auth/user/${Id}`);
        const { firstname, lastname, email } = response.data;
        setBillingDetails((prevDetails) => ({
          ...prevDetails,
          fullname: `${firstname} ${lastname}`,
          email,
          
        }));
      } catch (error) {
        setError('Error fetching user details: ' + (error.response?.data?.message || error.message));
        console.error('Error fetching user details:', error);
      }
    };

    fetchUserDetails();
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBillingDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements|| !clientSecret) {
      console.log("stripe", stripe)
      setError('Stripe or Elements not loaded');
      return;
    }

    setLoading(true);

    try {
      const paymentIntentResponse = await axios.post('http://localhost:3000/auth/create-payment-intent', {
        plan: plan.planType,
        Id,
      });
      console.log("selected plan", plan.planType, plan.price, price)

      if (paymentIntentResponse.status === 200) {
        setClientSecret(paymentIntentResponse.data.clientSecret);
      }

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(paymentIntentResponse.data.clientSecret, {
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
        console.error('Payment failed:', stripeError);
        setLoading(false);
        return;
      }

      const response = await axios.post('http://localhost:3000/auth/update-status', {
        Id,
        paymentIntentId: paymentIntent.id,
        status: 'paid',
        billingDetails,
      });

      if (response.status === 200) {
        alert('Payment succeeded!');
        closeModal();
        window.location.href = '/dashboard';
      }
    } catch (updateError) {
      if (updateError.response) {
        if (updateError.response.status === 400) {
          setError('Missing required fields in request body');
        } else if (updateError.response.status === 401) {
          setError('Missing payment intent ID or user already has an active subscription');
        } else if (updateError.response.status === 402) {
          setError('Payment intent not succeeded or not found');
        } else if (updateError.response.status === 405) {
          setError('User not found');
        } else if (updateError.response.status === 500) {
          setError('Internal server error while updating status');
        } else {
          setError('Error handling payment: ' + (updateError.response.data.message || updateError.message));
        }
      } else {
        setError('Network or server error');
      }
      console.error('Error handling payment:', updateError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2 className="mb-4">Checkout</h2>
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        <div className="form-group">
          <label htmlFor="fullname">Full Name:</label>
          <input
            type="text"
            id="fullname"
            name="fullname"
            className="form-control"
            value={billingDetails.fullname}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            className="form-control"
            value={billingDetails.email}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="address">Address:</label>
          <input
            type="text"
            id="address"
            name="address"
            className="form-control"
            value={billingDetails.address}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="city">City:</label>
          <input
            type="text"
            id="city"
            name="city"
            className="form-control"
            value={billingDetails.city}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="postalCode">Postal Code:</label>
          <input
            type="text"
            id="postalCode"
            name="postalCode"
            className="form-control"
            value={billingDetails.postalCode}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="country">Country:</label>
          <select
            id="country"
            name="country"
            className="form-control"
            value={billingDetails.country}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Country</option>
            {countries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group mt-4">
          <label htmlFor="cardNumber">Card Number:</label>
          <CardNumberElement id="cardNumber" className="form-control StripeElement" />
        </div>
        <div className="form-group mt-4">
          <label htmlFor="cardExpiry">Card Expiry:</label>
          <CardExpiryElement id="cardExpiry" className="form-control StripeElement" />
        </div>
        <div className="form-group mt-4">
          <label htmlFor="cardCvc">Card CVC:</label>
          <CardCvcElement id="cardCvc" className="form-control StripeElement" />
        </div>
        <div className="mt-3">
        <p>Price: {price === 0 ? "Free" : `R${price / 100} ZAR`}</p>
        <button type="submit" className="btn btn-primary" disabled={!stripe || loading}>
            {loading ? 'Processing...' : 'Pay'}
          </button>
        </div>
      </form>
    </div>
  );
};

CheckoutForm.propTypes = {
  plan: PropTypes.string.isRequired,
   userId: PropTypes.string.isRequired,
  closeModal: PropTypes.func.isRequired,
};

export default CheckoutForm;