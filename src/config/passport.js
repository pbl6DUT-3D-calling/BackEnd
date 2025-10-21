const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt = require("jsonwebtoken");
const { User } = require("../models");
require("dotenv").config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:8001/auth/google/callback",
      scope: ["email", "profile"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email)
          return done(null, false, {
            message: "Google account has no email associated.",
          });

        let user = await User.findOne({ where: { email } });

        if (!user) {
          user = await User.create({
            google_id: profile.id,
            username: profile.displayName,
            email,
            password: null,
            avatar_url: profile.photos?.[0]?.value || null,
          });
        } else if (!user.google_id) {
          // Cập nhật `google_id` nếu user đã có nhưng chưa có Google ID
          user.google_id = profile.id;
          await user.save();
        }

        const token = jwt.sign(
          { user_id: user.user_id, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRE }
        );

        return done(null, { token, user });
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

module.exports = passport;
