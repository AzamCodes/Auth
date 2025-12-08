/**
 * Winston Logger Configuration
 * Provides structured logging for the application
 */

const winston = require('winston');
const path = require('path');

// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

// Define log colors
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};

winston.addColors(colors);

// Define log format
const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.colorize({ all: true }),
    winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
);

// Define transports
const transports = [
    // Console transport
    new winston.transports.Console(),

    // Error log file
    new winston.transports.File({
        filename: path.join(__dirname, '../../logs/error.log'),
        level: 'error',
    }),

    // Combined log file
    new winston.transports.File({
        filename: path.join(__dirname, '../../logs/combined.log'),
    }),

    // Security events log
    new winston.transports.File({
        filename: path.join(__dirname, '../../logs/security.log'),
        level: 'warn',
    }),
];

// Create logger
const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'warn',
    levels,
    format,
    transports,
});

module.exports = logger;
