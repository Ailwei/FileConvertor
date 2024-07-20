const express = require('express');
const router = express.Router();
const {User} = require('../models/User');
const Subscription = require('../models/Subscription');
const { verifyUser } = require('./user');
require('dotenv').config();
const { sendConfirmationEmail } = require('../middleware/subscriptionConfirmation');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const axios = require('axios')
const {UserRouter} = require('./user')
const BillingDetails = require('../models/BillingDetails')

router.post('/create-payment-intent', verifyUser, async (req, res) => {
  const { plan, userId } = req.body;

  console.log('Received request for payment intent creation');
  console.log('Plan:', plan);
  console.log('User ID:', userId);
 

  const prices = {
    'free-trial': 0,
    'basic': 5000,
    'premium': 35000,
  };

  const amount = prices[plan];

  if (typeof amount === 'undefined') {
    console.error('Invalid plan selected');
    return res.status(400).send({ error: 'Invalid plan selected' });
  }

  try {
  
    const existingSubscription = await Subscription.findOne({ userId, status: { $in: ['pending', 'paid'] } });

    if (existingSubscription) {
      return res.status(400).json({ error: 'User already has an active subscription' });
    }

    if (plan === 'free-trial') {
      const setupIntent = await stripe.setupIntents.create({
        metadata: { userId, plan },
      });

      const subscription = new Subscription({
        userId: userId,
        plan,
        amount: 0,
        currency: 'zar',
        intentType: 'setup',
        paymentIntentId: setupIntent.id,
        status: 'pending',
        endDate: calculateEndDate(plan),
      });

      await subscription.save();

      console.log('Setup intent created successfully:', setupIntent.id);

      res.send({
        clientSecret: setupIntent.client_secret,
        amount: 0,
      });
    } else {
      console.log('Creating payment intent with amount:', amount);

      const paymentIntent = await stripe.paymentIntents.create({
        description: `Subscription to ${plan} plan`,
        amount: amount,
        currency: 'zar',
        metadata: { userId, plan },
      });

      console.log('Payment intent created with status:', paymentIntent.status);

      if (paymentIntent.status === 'requires_payment_method') {
        const subscription = new Subscription({
          userId: userId,
          plan,
          amount,
          currency: 'zar',
          intentType: 'payment',
          paymentIntentId: paymentIntent.id,
          status: 'pending',
          endDate: calculateEndDate(plan),
        });

        await subscription.save();

        console.log('Payment intent created successfully:', paymentIntent.id);

        res.send({
          clientSecret: paymentIntent.client_secret,
          amount: amount,
        });
      } else {
        console.error('Payment intent creation failed with status:', paymentIntent.status);
        return res.status(500).send({ error: 'Payment intent creation failed' });
      }
    }
  } catch (error) {
    console.error('Error creating payment intent:', error.message);
    res.status(500).send({ error: error.message });
  }
});

function calculateEndDate(plan) {
  const endDate = new Date();
  if (plan === 'free-trial') {
    endDate.setDate(endDate.getDate() + 7);
  } else {
    endDate.setDate(endDate.getDate() + 30);
  }
  return endDate;
}

router.post('/update-status', verifyUser, async (req, res) => {
  const { userId, paymentIntentId, status, billingDetails } = req.body;

  if (!userId || !paymentIntentId || !status || !billingDetails) {
    console.error('Missing required fields in request body:', req.body);
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    let subscription = await Subscription.findOne({ userId, paymentIntentId });

    if (!subscription) {
      console.error('Subscription not found for user:', userId, 'and paymentIntentId:', paymentIntentId);
      return res.status(404).json({ message: 'Subscription not found' });
    }

    if (status === 'paid') {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      if (!paymentIntent || paymentIntent.status !== 'succeeded') {
        console.error('Payment intent not succeeded or not found:', paymentIntentId);
        return res.status(400).json({ message: 'Payment intent not succeeded' });
      }

      subscription.status = 'paid';
    } else {
      subscription.status = status;
    }

    await subscription.save();

    const user = await User.findById(userId);
    if (!user) {
      console.error('User not found:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    if (status === 'paid' && billingDetails) {
      const billingDetail = new BillingDetails({
        userId: userId,
        fullname: billingDetails.fullname,
        email: billingDetails.email,
        address: {
          line1: billingDetails.address,
          city: billingDetails.city,
          postal_code: billingDetails.postalCode,
          country: billingDetails.country,
        },
      });

      await billingDetail.save().catch((error) => {
        console.error('Error inserting billing details:', error.message);
        return res.status(500).send({ error: 'Error inserting billing details' });
      });
    }

    const { firstname, lastname, email } = user;
    const fullName = `${firstname} ${lastname}`;

    let emailSubject, emailText;

    if (status === 'paid') {
      emailSubject = 'Subscription Confirmation';
      emailText = `Dear ${fullName},\n\nYour subscription has been successfully processed.\n\nThank you for choosing our service!`;
    } else if (status === 'pending') {
      emailSubject = 'Subscription Confirmation Pending';
      emailText = `Dear ${fullName},\n\nYour subscription is currently pending and will be activated shortly.\n\nThank you for choosing our service!`;
    }

    if (status === 'paid' || status === 'pending') {
      sendConfirmationEmail(
        user.email,
        emailSubject,
        emailText,
      );
    }

    res.json({ message: 'Subscription status updated successfully' });
  } catch (error) {
    console.error('Error updating subscription status:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.get('/current-subscription/:userId', verifyUser, async (req, res) => {
  const { userId } = req.params;

  try {
    const subscription = await Subscription.findOne({ userId, status: { $in: ['paid', 'pending'] } })
      .sort({ createdAt: -1 })
      .exec();

    if (!subscription) {
      return res.status(404).json({ message: 'No active subscription found' });
    }

    const currentDate = new Date();
    const endDate = new Date(subscription.endDate);
    const daysRemaining = Math.ceil((endDate - currentDate) / (1000 * 60 * 60 * 24));

    const subscriptionDetails = {
      plan: subscription.plan,
      amount: subscription.amount,
      currency: subscription.currency,
      status: subscription.status,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      daysRemaining: daysRemaining,
    };

    res.status(200).json(subscriptionDetails);
  } catch (error) {
    console.error('Error fetching subscription details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
router.delete('/cancel-subscription/:userId', verifyUser, async (req, res) => {
  const { userId } = req.params;

  try {
 
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }


    const subscriptions = await Subscription.find({ userId });

    if (subscriptions.length === 0) {
      return res.status(404).json({ message: 'No subscriptions found for this user' });
    }

    
    for (let subscription of subscriptions) {
     
      const { firstname, lastname } = user;
      const fullName = `${firstname} ${lastname}`;
      let emailSubject = 'Subscription Cancellation';
      let emailText = `Dear ${fullName},\n\nYour subscription has been cancelled.\n\nWe are sorry to see you go.`;

      const cancellationEmail = await sendConfirmationEmail(user.email, emailSubject, emailText);
      console.log('Cancellation email sent:', cancellationEmail);

      subscription.status = 'cancelled';
      await subscription.save();
    }

    return res.status(200).json({ message: 'Subscriptions cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling subscriptions:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});
router.get('/users/:userId/billing-details', verifyUser, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).exec();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const billingDetails = {
      name: `${user.firstname} ${user.lastname}`,
      email: user.email,
      address: {
        line1: user.address?.line1 || '',
        city: user.address?.city || '',
        postal_code: user.address?.postal_code || '',
        country: user.address?.country || '',
      },
    };

    res.json(billingDetails);
  } catch (error) {
    console.error('Error fetching billing details:', error.message);
    res.status(500).send({ error: error.message });
  }
});

router.post('/update-plan', verifyUser, async (req, res) => {
  const { userId, newPlan } = req.body;

  const prices = {
    'free-trial': 0,
    'basic': 5000,
    'premium': 35000,
  };

  const newAmount = prices[newPlan];

  if (typeof newAmount === 'undefined') {
    return res.status(400).send({ error: 'Invalid plan selected' });
  }

  try {
    let subscription = await Subscription.findOne({ userId, plan: newPlan }).exec();

    if (!subscription) {
      return res.status(404).json({ message: 'No active subscription found for the selected plan' });
    }

    const user = await User.findById(userId).exec();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const billingDetails = {
      name: `${user.firstname} ${user.lastname}`,
      email: user.email,
      address: {
        line1: user.address?.line1 || '',
        city: user.address?.city || '',
        postal_code: user.address?.postal_code || '',
        country: user.address?.country || '',
      },
    };

    console.log('Billing Details:', billingDetails);

    
    subscription.plan = newPlan;
    subscription.amount = newAmount;
    subscription.endDate = calculateEndDate(newPlan);

    if (subscription.status === 'pending' || subscription.amount !== newAmount) {
      const paymentIntent = await stripe.paymentIntents.create({
        description: `Upgrade to ${newPlan} plan`,
        amount: newAmount,
        currency: 'zar',
        metadata: { userId, plan: newPlan },
      });

      subscription.paymentIntentId = paymentIntent.id;
      subscription.intentType = 'payment';
      subscription.status = 'pending';
    }

    await subscription.save();

    res.status(200).json({
      message: 'Subscription plan updated successfully',
      billingDetails,
    });
  } catch (error) {
    console.error('Error updating subscription plan:', error.message);
    res.status(500).send({ error: error.message });
  }
});

router.get('/current-subscription/:userId', verifyUser, async (req, res) => {
  const { userId } = req.params;

  try {
    const subscription = await Subscription.findOne({ userId })
      .sort({ createdAt: -1 })
      .exec();

    if (!subscription) {
      return res.status(200).json({ 
        activePlan: null,
        message: 'No active subscription found'
      });
    }

    const currentDate = new Date();
    const endDate = new Date(subscription.endDate);
    const daysRemaining = Math.ceil((endDate - currentDate) / (1000 * 60 * 60 * 24));

    const subscriptionDetails = {
      plan: subscription.plan,
      amount: subscription.amount,
      currency: subscription.currency,
      status: subscription.status === 'paid' ? 'paid' : 'pending',
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      daysRemaining: daysRemaining,
    };

    res.status(200).json({ activePlan: subscriptionDetails });
  } catch (error) {
    console.error('Error fetching subscription details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.delete('/cancel-subscription/:userId', verifyUser, async (req, res) => {
  const { userId } = req.params;

  try {
 
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }


    const subscriptions = await Subscription.find({ userId });

    if (subscriptions.length === 0) {
      return res.status(404).json({ message: 'No subscriptions found for this user' });
    }

    
    for (let subscription of subscriptions) {
     
      const { firstname, lastname } = user;
      const fullName = `${firstname} ${lastname}`;
      let emailSubject = 'Subscription Cancellation';
      let emailText = `Dear ${fullName},\n\nYour subscription has been cancelled.\n\nWe are sorry to see you go.`;

      const cancellationEmail = await sendConfirmationEmail(user.email, emailSubject, emailText);
      console.log('Cancellation email sent:', cancellationEmail);

      subscription.status = 'cancelled';
      await subscription.save();
    }

    return res.status(200).json({ message: 'Subscriptions cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling subscriptions:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});
module.exports = {
  SubscriptionRouter: router
};