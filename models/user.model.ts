import mongoose from "mongoose";
import * as generate from '../helper/generate';

const userSchema = new mongoose.Schema({
  username: String,
  email: String, 
  password: {
    type: String,
    required: false 
  },
  phone: {
    type: String,
    default: null
  },
  address: {
    type: String,
    default: null
  },
  slogan: String,
  facebook: {
    type: String,
    default: null
  },
  instagram: {
    type: String,
    default: null
  },
  twitter: {
    type: String,
    default: null
  },
  tokenUser: {
    type: String,
    default: generate.generateRandomString(20)
  },
  googleId: {
    type: String,
    default: null
  },
  avatar: {
    type: String,
    default: null
  },
  status: {
    type: String,
    default: 'active'
  },
  deleted: {
    type: Boolean,
    default: false
  },
  verify: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema, 'users');
export default User;