/**
 * Script to make a user an admin
 * Usage: node src/scripts/makeAdmin.js <email>
 */

require('dotenv').config();
const User = require('../models/User');
const connectDB = require('../config/database');

const makeAdmin = async () => {
    const email = process.argv[2];

    if (!email) {
        // console.error('Please provide an email address');
        // console.log('Usage: node src/scripts/makeAdmin.js <email>');
        process.exit(1);
    }

    try {
        await connectDB();

        const user = await User.findOne({ email });

        if (!user) {
            // console.error(`User with email ${email} not found`);
            process.exit(1);
        }

        if (user.role === 'admin') {
            // console.log(`User ${email} is already an admin`);
            process.exit(0);
        }

        user.role = 'admin';
        await user.save();

        // console.log(`Successfully made ${email} an admin`);
        process.exit(0);
    } catch (error) {
        // console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

makeAdmin();
