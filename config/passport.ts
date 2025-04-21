import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/user.model'; 
import * as helper from '../helper/generate';

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.serializeUser((user: any, done) => {
  done(null, user.id); // chỉ lưu ID
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id); // lấy user từ DB
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error('Missing Google OAuth credentials in .env');
}
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: 'http://localhost:3000/user/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0].value;
        const googleId = profile.id;
        let user = await User.findOne({ googleId });

        if (!user) {
          user = await User.create({
            username: profile.displayName,
            email,
            googleId,
            tokenUser: helper.generateRandomString(20)
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, undefined);
      }
    }
  )
);

export default passport;

