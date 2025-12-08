/**
 * User Routes
 * Defines user profile-related API endpoints
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/authenticate');
const validate = require('../middleware/validate');
const upload = require('../utils/upload');
const { updateProfileValidation } = require('../utils/validators');

// All user routes require authentication
router.use(authenticate);

// User profile routes
router.get('/profile', userController.getProfile);
router.put('/profile', updateProfileValidation, validate, userController.updateProfile);
router.post('/profile/picture', upload.single('picture'), userController.uploadProfilePicture);

module.exports = router;
