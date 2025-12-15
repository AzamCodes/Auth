
require('dotenv').config();
// console.log('MONGODB_URI:', process.env.MONGODB_URI);  // ← NOW YOU WILL SEE THE REAL URI
// console.log('.env loaded keys:', Object.keys(process.env).filter(k => k.includes('MONGO') || k.includes('JWT')));
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const useragent = require('express-useragent');
const path = require('path');

const connectDB = require('./config/database');
const logger = require('./config/logger');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Initialize express app
const app = express();


// Connect to database
connectDB();

// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
    next();
});

console.log('check frontend url', process.env.CLIENT_URL)

// Trust proxy (for production behind reverse proxy)
// Trust proxy (necessary for Railway/Vercel)
app.set('trust proxy', 1);

// Security middleware
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
        crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    })
);

// CORS configuration
// CORS configuration
const clientUrls = (process.env.CLIENT_URL || 'http://localhost:3000').split(',').map(url => url.trim());
console.log('Allowed Origins:', clientUrls);

const allowedOrigins = clientUrls.map(url => url.endsWith('/') ? url.slice(0, -1) : url);

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (like mobile apps or curl requests)
            if (!origin) return callback(null, true);

            // Check if origin matches allowed origin (ignoring trailing slash)
            const originClean = origin.endsWith('/') ? origin.slice(0, -1) : origin;

            if (allowedOrigins.includes(originClean)) {
                callback(null, true);
            } else {
                console.warn(`Blocked by CORS: ${origin}`);
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
);
// Explicitly handle OPTIONS for preflight resilience
app.options('*', cors());
app.use(mongoSanitize()); // Prevent MongoDB injection

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// User agent parser
app.use(useragent.express());

// Initialize Passport
const passport = require('./config/passport');
app.use(passport.initialize());

// Rate limiting
app.use('/api', generalLimiter);

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
    });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// Welcome route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to MERN Auth System API',
        version: '1.0.0',
        documentation: '/api/docs',
    });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Server configuration
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Start server
const server = app.listen(PORT, () => {
    logger.info(`Server running in ${NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    logger.error(`Unhandled Rejection: ${err.message}`);
    server.close(() => {
        process.exit(1);
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger.error(`Uncaught Exception: ${err.message}`);
    process.exit(1);
});

module.exports = app;
