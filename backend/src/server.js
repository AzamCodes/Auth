
// require('dotenv').config();
// // console.log('MONGODB_URI:', process.env.MONGODB_URI);  // ← NOW YOU WILL SEE THE REAL URI
// // console.log('.env loaded keys:', Object.keys(process.env).filter(k => k.includes('MONGO') || k.includes('JWT')));
// const express = require('express');
// const cors = require('cors');
// const helmet = require('helmet');
// const mongoSanitize = require('express-mongo-sanitize');
// const cookieParser = require('cookie-parser');
// const useragent = require('express-useragent');
// const path = require('path');

// const connectDB = require('./config/database');
// const logger = require('./config/logger');
// const { notFound, errorHandler } = require('./middleware/errorHandler');
// const { generalLimiter } = require('./middleware/rateLimiter');

// // Import routes
// const authRoutes = require('./routes/authRoutes');
// const userRoutes = require('./routes/userRoutes');
// const adminRoutes = require('./routes/adminRoutes');

// // Initialize express app
// const app = express();

// // Connect to database
// connectDB();

// // Trust proxy (for production behind reverse proxy)
// app.set('trust proxy', 1);

// // Security middleware
// app.use(helmet());
// app.use(
//     cors({
//         origin: process.env.CLIENT_URL || 'http://localhost:3000',
//         credentials: true,
//     })
// );
// app.use(mongoSanitize()); // Prevent MongoDB injection

// // Body parser middleware
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// // Cookie parser
// app.use(cookieParser());

// // User agent parser
// app.use(useragent.express());

// // Initialize Passport
// const passport = require('./config/passport');
// app.use(passport.initialize());

// // Rate limiting
// app.use('/api', generalLimiter);

// // Serve static files (uploads)
// app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// // Health check endpoint
// app.get('/health', (req, res) => {
//     res.json({
//         success: true,
//         message: 'Server is running',
//         timestamp: new Date().toISOString(),
//     });
// });

// // API routes
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/admin', adminRoutes);

// // Welcome route
// app.get('/', (req, res) => {
//     res.json({
//         success: true,
//         message: 'Welcome to MERN Auth System API',
//         version: '1.0.0',
//         documentation: '/api/docs',
//     });
// });

// // Error handling middleware
// app.use(notFound);
// app.use(errorHandler);

// // Server configuration
// const PORT = process.env.PORT || 5000;
// const NODE_ENV = process.env.NODE_ENV || 'development';

// // Start server
// const server = app.listen(PORT, () => {
//     logger.info(`Server running in ${NODE_ENV} mode on port ${PORT}`);
// });

// // Handle unhandled promise rejections
// process.on('unhandledRejection', (err) => {
//     logger.error(`Unhandled Rejection: ${err.message}`);
//     server.close(() => {
//         process.exit(1);
//     });
// });

// // Handle uncaught exceptions
// process.on('uncaughtException', (err) => {
//     logger.error(`Uncaught Exception: ${err.message}`);
//     process.exit(1);
// });

// module.exports = app;


require('dotenv').config();

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

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

/* =======================
   DATABASE
======================= */
connectDB();

/* =======================
   TRUST PROXY (REQUIRED)
======================= */
app.set('trust proxy', 1);

/* =======================
   CORS — DONE CORRECTLY
======================= */
const allowedOrigins = [
  'http://localhost:3000',
  process.env.CLIENT_URL, // your Vercel URL EXACT
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

app.options('*', cors());

/* =======================
   SECURITY
======================= */
app.use(helmet());
app.use(mongoSanitize());

/* =======================
   BODY PARSERS
======================= */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/* =======================
   COOKIES + UA
======================= */
app.use(cookieParser());
app.use(useragent.express());

/* =======================
   PASSPORT
======================= */
const passport = require('./config/passport');
app.use(passport.initialize());

/* =======================
   RATE LIMIT
======================= */
app.use('/api', generalLimiter);

/* =======================
   STATIC FILES
======================= */
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

/* =======================
   DEBUG ORIGIN (REMOVE LATER)
======================= */
app.use((req, res, next) => {
  console.log('ORIGIN:', req.headers.origin);
  next();
});

/* =======================
   ROUTES
======================= */
app.get('/health', (req, res) => {
  res.json({ success: true, status: 'OK' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API running' });
});

/* =======================
   ERRORS
======================= */
app.use(notFound);
app.use(errorHandler);

/* =======================
   SERVER
======================= */
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

/* =======================
   PROCESS SAFETY
======================= */
process.on('unhandledRejection', err => {
  logger.error(err);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', err => {
  logger.error(err);
  process.exit(1);
});

module.exports = app;

