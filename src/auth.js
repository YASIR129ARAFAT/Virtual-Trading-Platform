const GoogleStrategy = require("passport-google-oauth2").Strategy;

const GithubStrategy = require("passport-github2").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const passport = require("passport");
// end point=http://localhost:80/google/callback
const GOOGLE_CLIENT_ID =
  "460411624280-31fafqk6s7v232ofgcnj9fbjje3h0f04.apps.googleusercontent.com";

const GOOGLE_CLIENT_SECRET = "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";

const GITHUB_CLIENT_ID = "87b57950d7826b87d079";

const GITHUB_CLIENT_SECRET = "9a2168afe4187ab6754b20ad80576aefc251649b";

const FACEBOOK_CLIENT_ID = "87b57950d7826b87d079";

const FACEBOOK_CLIENT_SECRET = "9a2168afe4187ab6754b20ad80576aefc251649b";
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:80/google/callback",
      passReqToCallback: true,
    },
    function (request, accessToken, refreshToken, profile, done) {
     console.log(profile);
        return done(null, profile);
    
    }
  )
);

passport.use(
  new GithubStrategy(
    {
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: "http://localhost:80/github/callback",
      passReqToCallback: true,
    },
    function (request, accessToken, refreshToken, profile, done) {
      console.log(profile);
      return done(null, profile);
    }
  )
);


passport.use(
  new FacebookStrategy(
    {
      clientID: FACEBOOK_CLIENT_ID,
      clientSecret: FACEBOOK_CLIENT_SECRET,
      callbackURL: "http://localhost:80/facebook/callback",
      passReqToCallback: true,
    },
    function (request, accessToken, refreshToken, profile, done) {
      console.log(profile);
      return done(null, profile);
    }
  )
);
passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});
