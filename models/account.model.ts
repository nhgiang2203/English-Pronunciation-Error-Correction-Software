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
  avt: String,
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