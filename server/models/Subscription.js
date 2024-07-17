const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    plan: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    intentType: { type: String, enum: ['setup', 'payment'], required: true },
    paymentIntentId: { type: String, required: true },
    status: { type: String, required: true },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
  });

const Subscription = mongoose.model('Subscription', SubscriptionSchema);
module.exports =  Subscription;
