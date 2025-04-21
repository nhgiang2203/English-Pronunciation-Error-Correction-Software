import mongoose from "mongoose";
import * as generate from '../helper/generate';

const userSchema = new mongoose.Schema({
  username: String,
  email: String, 
  password: {
    type: String,
    required: false 
  },
  tokenUser: {
    type: String,
    default: generate.generateRandomString(20)
  },
  googleId: {
    type: String,
    default: null
  },
  avatar: String,
  status: {
    type: String,
    default: 'active'
  },
  deleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema, 'users');
export default User;