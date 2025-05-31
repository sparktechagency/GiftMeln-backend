import passport from "passport";
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import config from ".";
import { USER_ROLES } from "../enums/user";

passport.use(
  new GoogleStrategy(
    {
      clientID: config.google.clientID!,
      clientSecret: config.google.clientSecret!,
      callbackURL: config.google.callbackURL!,  
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      req.body.profile = profile
      req.body.role = USER_ROLES.USER
 
      try {
        return done(null, req.body)
      } catch (err) {
        return done(err)
      }
    },
  ),
)

export default passport;