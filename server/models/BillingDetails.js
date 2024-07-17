const mongoose = require('mongoose');

const BillingDetailsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fullname: { type: String, required: true },
  email: { type: String, required: true },
  address: {
    line1: { type: String, required: true },
    city: { type: String, required: true },
    postal_code: { type: String, required: true },
    country: { type: String, required: true },
  },
}, { timestamps: true });

module.exports = mongoose.model('BillingDetails', BillingDetailsSchema);

