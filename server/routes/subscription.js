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
const cron = require('node-cron');

router.post('/create-payment-intent', verifyUser, async (req, res) => {
  const { plan, userId } = req.body;

  console.log('Received request for payment intent creation');
  console.log('Plan:', plan);
  console.log('User ID:', userId);
 

  const prices = {
    'basic': 0,
    'premium': 50000,
    'LifeTime': 150000,
  };

  const amount = prices[plan];

  if (typeof amount === 'undefined') {
    console.error('Invalid plan selected');
    return res.status(400).send({ error: 'Invalid plan selected' });
  }

  try {
  
    const existingSubscription = await Subscription.findOne({ userId, status: { $in: ['pending', 'paid'] } });

    if (existingSubscription) {
      return res.status(401).json({ error: 'User already has an active subscription' });
    }

    if (plan === 'basic') {
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
          status: 'paid',
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
  if (plan === 'premium'  || plan === 'basic') {
    endDate.setDate(endDate.getDate() + 30);
  } else if (plan === 'lifetime') {
    endDate.setFullYear(endDate.getFullYear() + 100);
  }
  return endDate;
}

router.post('/update-status', verifyUser, async (req, res) => {
  const { userId, paymentIntentId, status, billingDetails } = req.body;

  if (!userId || !status || !billingDetails) {
    console.error('Missing required fields in request body:', req.body);
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    
    let subscription = await Subscription.findOne({ userId });

    if (!subscription) {
      subscription = new Subscription({ userId });
    }
    if (status === 'pending') {
      subscription.status = 'pending';
    } else if (status === 'paid') {
      if (!paymentIntentId) {
        return res.status(401).json({ message: 'Missing payment intent ID' });
      }

      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      if (!paymentIntent || paymentIntent.status !== 'succeeded') {
        console.error('Payment intent not succeeded or not found:', paymentIntentId);
        return res.status(402).json({ message: 'Payment intent not succeeded' });
      }

      subscription.status = 'paid';
    }

    await subscription.save();

    const user = await User.findById(userId);
    if (!user) {
      console.error('User not found:', userId);
      return res.status(405).json({ message: 'User not found' });
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
    } else if (status === 'trial') {
      emailSubject = 'basic plan Confirmation';
      emailText = `Dear ${fullName},\n\nYour free trial has been successfully activated.\n\nEnjoy your trial period!`;
    } else if (status === 'pending') {
      emailSubject = 'Subscription Confirmation Pending';
      emailText = `Dear ${fullName},\n\nYour subscription is currently pending and will be activated shortly.\n\nThank you for choosing our service!`;
    }

    if (status === 'paid' || status === 'trial' || status === 'pending') {
      sendConfirmationEmail(user.email, emailSubject, emailText);
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
      return res.status(406).json({ message: 'Continue with your Subscription' });
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
      return res.status(407).json({ message: 'User not found' });
    }


    const subscriptions = await Subscription.find({ userId });

    if (subscriptions.length === 0) {
      return res.status(408).json({ message: 'No subscriptions found for this user' });
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
      return res.status(409).json({ message: 'User not found' });
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
    'basic': 0,
    'premium': 50000,
    'LifeTime': 150000,
  };

  const newAmount = prices[newPlan];

  if (typeof newAmount === 'undefined') {
    return res.status(400).send({ error: 'Invalid plan selected' });
  }

  try {
    let subscription = await Subscription.findOne({ userId, plan: newPlan }).exec();

    if (!subscription) {
      return res.status(401).json({ message: 'No active subscription found for the selected plan' });
    }

    const user = await User.findById(userId).exec();
    if (!user) {
      return res.status(402).json({ message: 'User not found' });
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
cron.schedule('* * * * *', async () => {
  console.log('Cron job executed at:', new Date());
  const now = new Date();
  const reminderPeriod = 5;
  const reminderStartDate = new Date();
  reminderStartDate.setDate(now.getDate() + reminderPeriod);

  try {
    console.log('Reminder Start Date:', reminderStartDate);

    const subscriptions = await Subscription.find({
      status: 'pending',
      endDate: { $gte: reminderStartDate },
    });

    console.log('Subscriptions found:', subscriptions);

    for (const subscription of subscriptions) {
      const user = await User.findById(subscription.userId);
      if (!user) {
        console.error(`User not found for Subscription: ${subscription.userId}`);
        continue;
      }

      console.log('User found:', user);
      console.log('Subscription End Date:', subscription.endDate);

      const daysUntilExpiry = Math.ceil((subscription.endDate - now) / (1000 * 60 * 60 * 24));
      console.log('Days Until Expiry:', daysUntilExpiry);

      if (daysUntilExpiry > 0) {
        if (!subscription.reminderSentDates || !subscription.reminderSentDates.includes(now.toDateString())) {
          const emailSubject = 'Trial Expiry Reminder';
          const emailText = `Dear ${user.firstname} ${user.lastname},\n\nYour trial subscription will expire in ${daysUntilExpiry} days. Please renew your subscription or cancel it before the expiry date.\n\nIf you do not take any action, you will be automatically upgraded to the premium plan and charged accordingly.\n\nThank you for being with us!`;

          try {
            await sendConfirmationEmail(user.email, emailSubject, emailText);
            console.log('Reminder email sent to:', user.email);
            subscription.reminderSentDates = subscription.reminderSentDates || [];
            subscription.reminderSentDates.push(now.toDateString());
            await subscription.save();
          } catch (emailError) {
            console.error('Error sending reminder email:', emailError.message);
          }
        }
      } else {
        const newPlan = 'premium';
        const newAmount = 50000;

        try {
          console.log('Creating payment intent for auto-upgrade...');
          const paymentIntent = await stripe.paymentIntents.create({
            description: `Auto-upgrade to ${newPlan} plan`,
            amount: newAmount,
            currency: 'zar',
            metadata: { userId: subscription.userId.toString(), plan: newPlan },
            payment_method: 'pm_card_visa',
            confirm: true,
            off_session: true,
          });

          console.log('Payment Intent created:', paymentIntent);

          if (paymentIntent.status === 'succeeded') {
            subscription.plan = newPlan;
            subscription.amount = newAmount;
            subscription.intentType = 'payment';
            subscription.paymentIntentId = paymentIntent.id;
            subscription.status = 'paid';
            subscription.endDate = calculateEndDate(newPlan);

            await subscription.save();
            const confirmationEmailSubject = 'Subscription Auto-Upgrade';
            const confirmationEmailText = `Dear ${user.firstname} ${user.lastname},\n\nYour trial subscription has expired and has been automatically upgraded to the premium plan. Your card has been charged for the renewal.\n\nThank you for continuing with our service!`;

            try {
              await sendConfirmationEmail(user.email, confirmationEmailSubject, confirmationEmailText);
              console.log('Confirmation email sent to:', user.email);
            } catch (emailError) {
              console.error('Error sending confirmation email:', emailError.message);
            }
          } else {
            console.error(`Payment intent status: ${paymentIntent.status}`);
            subscription.status = 'pending';
            await subscription.save();
          }

        } catch (stripeError) {
          console.error('Stripe error during auto-upgrade:', stripeError.message);
          subscription.status = 'failed';
          await subscription.save();
        }
      }
    }

    const paidSubscriptions = await Subscription.find({
      status: 'paid',
      endDate: { $lt: now },
    });

    console.log('Paid subscriptions needing renewal:', paidSubscriptions);

    for (const subscription of paidSubscriptions) {
      const user = await User.findById(subscription.userId);
      if (!user) {
        console.error(`User not found for Subscription: ${subscription.userId}`);
        continue;
      }

      console.log('User found:', user);

      if (subscription.plan === 'premium') {
        const newEndDate = calculateEndDate(subscription.plan);

        try {
          console.log('Creating payment intent for renewal...');
          const paymentIntent = await stripe.paymentIntents.create({
            description: `Renewal for ${subscription.plan} plan`,
            amount: subscription.amount,
            currency: 'zar',
            metadata: { userId: subscription.userId.toString(), plan: subscription.plan },
            payment_method: 'pm_card_visa',
            confirm: true,
            off_session: true,
          });

          console.log('Payment Intent created for renewal:', paymentIntent);

          if (paymentIntent.status === 'succeeded') {
            subscription.endDate = newEndDate;

            await subscription.save();

            const renewalEmailSubject = 'Subscription Renewal Confirmation';
            const renewalEmailText = `Dear ${user.firstname} ${user.lastname},\n\nYour subscription has been successfully renewed. Your new subscription period will end on ${newEndDate.toDateString()}.\n\nThank you for continuing with our service!`;

            try {
              await sendConfirmationEmail(user.email, renewalEmailSubject, renewalEmailText);
              console.log('Renewal confirmation email sent to:', user.email);
            } catch (emailError) {
              console.error('Error sending renewal confirmation email:', emailError.message);
            }
          } else {
            console.error(`Payment intent status: ${paymentIntent.status}`);
            subscription.status = 'pending';
            await subscription.save();
          }

        } catch (stripeError) {
          console.error('Stripe error during renewal:', stripeError.message);
          subscription.status = 'failed';
          await subscription.save();
        }
      } else if (subscription.plan === 'LifeTime') {
        console.log(`Lifetime plan for user ${user._id} does not require renewal.`);
      }
    }

  } catch (error) {
    console.error('Error processing subscriptions:', error.message);
  }
});

module.exports = {
  SubscriptionRouter: router
};