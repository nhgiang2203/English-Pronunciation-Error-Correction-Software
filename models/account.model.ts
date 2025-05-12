import mongoose from "mongoose";
import * as generate from '../helper/generate';

const accountSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  token: {
    type: String,
    default: generate.generateRandomString(20)
  },
  avatar: {
    type: String,
    default: 'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3.webp'
  },
  phone: String,
  address: String,
  role: String,
  verify: {
    type: Boolean,
    default: false
  },
  status: String,
  deleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const Account = mongoose.model('Account', accountSchema, 'accounts');
export default Account;