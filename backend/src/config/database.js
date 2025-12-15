/**
 * MongoDB Database Configuration
 * Establishes connection to MongoDB using Mongoose
 */

const mongoose = require('mongoose');
const logger = require('./logger');

/**
 * Connect to MongoDB database
 * @returns {Promise<void>}
 */
const connectDB = async () => {
    try {
        // console.log('Current working directory:', process.cwd());
        // console.log('MONGODB_URI from env:', process.env.MONGODB_URI);
        // console.log('All env keys:', Object.keys(process.env).filter(k => k.includes('MONGO')));
        const conn = await mongoose.connect(process.env.MONGODB_URI);

        logger.info(`MongoDB Connected: ${conn.connection.host}`);

        // Handle connection events
        mongoose.connection.on('disconnected', () => {
            logger.warn('MongoDB disconnected');
        });

        mongoose.connection.on('error', (err) => {
            logger.error(`MongoDB connection error: ${err}`);
        });

        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            logger.info('MongoDB connection closed through app termination');
            process.exit(0);
        });
    } catch (error) {
        logger.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
