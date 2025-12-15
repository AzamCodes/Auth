/**
 * Passport Configuration
 * Configures Google OAuth 2.0 strategy
 */

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const logger = require('./logger');

// Serialize user for session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Google OAuth Strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
            proxy: true,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Check if user already exists
                let user = await User.findOne({ email: profile.emails[0].value });

                if (user) {
                    // User exists, update last login
                    user.lastLogin = new Date();
                    user.isEmailVerified = true; // Google emails are verified
                    await user.save();

                    logger.info(`Google OAuth: Existing user logged in - ${user.email}`);
                    return done(null, user);
                }

                // Create new user
                user = await User.create({
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    password: Math.random().toString(36).slice(-12) + 'Aa1!', // Random password
                    profilePicture: profile.photos[0]?.value || '',
                    isEmailVerified: true, // Google emails are verified
                    lastLogin: new Date(),
                });

                logger.info(`Google OAuth: New user created - ${user.email}`);
                done(null, user);
            } catch (error) {
                logger.error(`Google OAuth error: ${error.message}`);
                done(error, null);
            }
        }
    )
);

// GitHub OAuth Strategy
const GitHubStrategy = require('passport-github2').Strategy;
// In server.js (temporarily)
// console.log('GitHub Client ID:', process.env.GITHUB_CLIENT_ID);
// console.log('GitHub Client Secret:', process.env.GITHUB_CLIENT_SECRET);
// console.log('GitHub Callback:', process.env.GITHUB_CALLBACK_URL);
passport.use(
    new GitHubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/api/auth/github/callback',
            proxy: true,
            scope: ['user:email'],
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // GitHub might not return email in profile if it's private
                const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;

                if (!email) {
                    return done(new Error('No email found from GitHub profile. Please make your email public or use another login method.'), null);
                }

                // Check if user already exists
                let user = await User.findOne({ email });

                if (user) {
                    // User exists, update last login
                    user.lastLogin = new Date();
                    // user.isEmailVerified = true; // GitHub emails are verified
                    await user.save();

                    logger.info(`GitHub OAuth: Existing user logged in - ${user.email}`);
                    return done(null, user);
                }

                // Create new user
                user = await User.create({
                    name: profile.displayName || profile.username,
                    email: email,
                    password: Math.random().toString(36).slice(-12) + 'Aa1!', // Random password
                    profilePicture: profile.photos && profile.photos[0] ? profile.photos[0].value : '',
                    isEmailVerified: true,
                    lastLogin: new Date(),
                });

                logger.info(`GitHub OAuth: New user created - ${user.email}`);
                done(null, user);
            } catch (error) {
                logger.error(`GitHub OAuth error: ${error.message}`);
                done(error, null);
            }
        }
    )
);

module.exports = passport;
