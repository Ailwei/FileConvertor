const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  firstname: {
    type: String,
    required: true,
    unique: false,
  },
  lastname: {
    type: String,
    required: true,
    unique: false,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  subscription: {
    type: Schema.Types.ObjectId,
    ref: 'Subscription',
  },
}, { timestamps: true });

const UserModel =  mongoose.model('User', userSchema)
module.exports =  {
    User:UserModel, };
