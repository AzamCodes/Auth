/**
 * User Controller
 * Handles user profile and related operations
 */

const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../config/logger');

/**
 * Get user profile
 * @route GET /api/users/profile
 * @access Private
 */
const getProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found',
        });
    }

    res.json({
        success: true,
        user,
    });
});

/**
 * Update user profile
 * @route PUT /api/users/profile
 * @access Private
 */
const updateProfile = asyncHandler(async (req, res) => {
    const { name, email } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found',
        });
    }

    // Check if email is being changed
    if (email && email !== user.email) {
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already in use',
            });
        }

        user.email = email;
        user.isEmailVerified = false; // Require re-verification
    }

    if (name) user.name = name;

    await user.save();

    logger.info(`Profile updated for user: ${user.email}`);

    res.json({
        success: true,
        message: 'Profile updated successfully',
        user,
    });
});

/**
 * Upload profile picture
 * @route POST /api/users/profile/picture
 * @access Private
 */
const uploadProfilePicture = asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'No file uploaded',
        });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found',
        });
    }

    // Save file path (in production, upload to cloud storage like S3)
    user.profilePicture = `/uploads/${req.file.filename}`;
    await user.save();

    logger.info(`Profile picture uploaded for user: ${user.email}`);

    res.json({
        success: true,
        message: 'Profile picture uploaded successfully',
        profilePicture: user.profilePicture,
    });
});

module.exports = {
    getProfile,
    updateProfile,
    uploadProfilePicture,
};
