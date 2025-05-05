import mongoose from "mongoose";

const confirmEmailSchema = new mongoose.Schema({
  email: String,
  otp: String,
  expireAt: {
    type: Date,
    expires: 180
  }
}, {
  timestamps: true
});

const ConfirmEmail = mongoose.model('ConfirmEmail', confirmEmailSchema, 'email-confirm');
export default ConfirmEmail;