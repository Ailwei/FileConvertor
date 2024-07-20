import { useEffect, useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import PropTypes from 'prop-types';
import axios from 'axios';
import jwt_decode from 'jwt-decode';
import '../src/assets/Checkout.css';


const countries = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'ZA', name: 'South Africa' },
];

const CheckoutForm = ({ plan, closeModal }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState('');
  const [price, setPrice] = useState(0);
  const [billingDetails, setBillingDetails] = useState({
    fullname: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
  });
  const [decodedToken, setDecodedToken] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = sessionStorage.getItem('authToken');
        if (token) {
          const decoded = jwt_decode(token);
          setDecodedToken(decoded);

          const userDetailsResponse = await axios.get(`http://localhost:3000/auth/user/${decoded.userId}`);
          const { firstname, lastname, email } = userDetailsResponse.data;
          setBillingDetails((prevDetails) => ({
            ...prevDetails,
            fullname: `${firstname} ${lastname}`,
            email,
          }));

          const paymentIntentResponse = await axios.post('http://localhost:3000/auth/create-payment-intent', {
            plan,
            userId: decoded.userId,
          });

          setClientSecret(paymentIntentResponse.data.clientSecret);
          setPrice(paymentIntentResponse.data.amount);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchUserDetails();
  }, [plan]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBillingDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret || !decodedToken) {
      return;
    }

    try {
      let response;

      if (plan === 'free-trial') {
        const { error, setupIntent } = await stripe.confirmCardSetup(clientSecret, {
          payment_method: {
            card: elements.getElement(CardElement),
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

        if (error) {
          console.error('Setup failed:', error);
          return;
        }

        response = await axios.post('http://localhost:3000/auth/update-status', {
          userId: decodedToken.userId,
          paymentIntentId: setupIntent.id,
          status: 'pending',
          billingDetails,
        });
      } else {
        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: elements.getElement(CardElement),
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

        if (error) {
          console.error('Payment failed:', error);
          return;
        }

        response = await axios.post('http://localhost:3000/auth/update-status', {
          userId: decodedToken.userId,
          paymentIntentId: paymentIntent.id,
          status: 'paid',
          billingDetails,
        });
      }

      if (response.status === 200) {
        if (plan === 'free-trial') {
          alert('Free trial subscription succeeded!');
        } else {
          alert('Payment succeeded!');
        }
        closeModal();
        window.location.href = '/dashboard';
      }
    } catch (updateError) {
      console.error('Error handling payment:', updateError);
    }
  };

  return (
    <div className="container">
      <h2 className="mb-4">Checkout</h2>
      <form onSubmit={handleSubmit}>
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
          <CardElement />
        </div>
        <div className="mt-3">
          <p>Price: {price / 100} ZAR</p>
          <button type="submit" className="btn btn-primary" disabled={!stripe}>
            Pay
          </button>
        </div>
      </form>
    </div>
  );
};

CheckoutForm.propTypes = {
  plan: PropTypes.string.isRequired,
  closeModal: PropTypes.func.isRequired,
};

export default CheckoutForm;
