/**
 * Admin Controller
 * Handles admin-specific operations
 */

const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../config/logger');

/**
 * Get all users with pagination, search, and filter
 * @route GET /api/admin/users
 * @access Private (Admin only)
 */
const getUsers = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        search = '',
        role = '',
        isEmailVerified = '',
        isSuspended = '',
        sortBy = 'createdAt',
        sortOrder = 'desc',
    } = req.query;

    // Build filter
    const filter = {};

    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
        ];
    }

    if (role) filter.role = role;
    if (isEmailVerified !== '') filter.isEmailVerified = isEmailVerified === 'true';
    if (isSuspended !== '') filter.isSuspended = isSuspended === 'true';

    // Execute query
    const users = await User.find(filter)
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

    // Get total count
    const count = await User.countDocuments(filter);

    res.json({
        success: true,
        users,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        totalUsers: count,
    });
});

/**
 * Get user by ID
 * @route GET /api/admin/users/:id
 * @access Private (Admin only)
 */
const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found',
        });
    }

    // Get user's active sessions
    const activeSessions = await RefreshToken.find({
        userId: user._id,
        isRevoked: false,
        expiresAt: { $gt: new Date() },
    });

    res.json({
        success: true,
        user,
        activeSessions: activeSessions.length,
    });
});

/**
 * Suspend user
 * @route PUT /api/admin/users/:id/suspend
 * @access Private (Admin only)
 */
const suspendUser = asyncHandler(async (req, res) => {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found',
        });
    }

    if (user.role === 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Cannot suspend admin users',
        });
    }

    user.isSuspended = true;
    user.suspendedAt = new Date();
    user.suspendedBy = req.user.id;
    user.suspensionReason = reason || 'No reason provided';
    await user.save();

    // Revoke all refresh tokens
    await RefreshToken.updateMany(
        { userId: user._id },
        { isRevoked: true, revokedAt: new Date() }
    );

    logger.warn(`User suspended: ${user.email} by ${req.user.email}`);

    res.json({
        success: true,
        message: 'User suspended successfully',
    });
});

/**
 * Unsuspend user
 * @route PUT /api/admin/users/:id/unsuspend
 * @access Private (Admin only)
 */
const unsuspendUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found',
        });
    }

    user.isSuspended = false;
    user.suspendedAt = undefined;
    user.suspendedBy = undefined;
    user.suspensionReason = undefined;
    await user.save();

    logger.info(`User unsuspended: ${user.email} by ${req.user.email}`);

    res.json({
        success: true,
        message: 'User unsuspended successfully',
    });
});

/**
 * Delete user
 * @route DELETE /api/admin/users/:id
 * @access Private (Admin only)
 */
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found',
        });
    }

    if (user.role === 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Cannot delete admin users',
        });
    }

    // Delete user's refresh tokens
    await RefreshToken.deleteMany({ userId: user._id });

    // Delete user
    await user.deleteOne();

    logger.warn(`User deleted: ${user.email} by ${req.user.email}`);

    res.json({
        success: true,
        message: 'User deleted successfully',
    });
});

/**
 * Update user role
 * @route PUT /api/admin/users/:id/role
 * @access Private (Admin only)
 */
const updateUserRole = asyncHandler(async (req, res) => {
    const { role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found',
        });
    }

    if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid role',
        });
    }

    user.role = role;
    await user.save();

    logger.info(`User role updated: ${user.email} to ${role} by ${req.user.email}`);

    res.json({
        success: true,
        message: 'User role updated successfully',
        user,
    });
});

/**
 * Get system statistics
 * @route GET /api/admin/stats
 * @access Private (Admin only)
 */
const getStats = asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ isEmailVerified: true });
    const suspendedUsers = await User.countDocuments({ isSuspended: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const activeTokens = await RefreshToken.countDocuments({
        isRevoked: false,
        expiresAt: { $gt: new Date() },
    });

    // Users registered in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    res.json({
        success: true,
        stats: {
            totalUsers,
            verifiedUsers,
            unverifiedUsers: totalUsers - verifiedUsers,
            suspendedUsers,
            adminUsers,
            regularUsers: totalUsers - adminUsers,
            activeTokens,
            newUsersLast30Days: newUsers,
        },
    });
});

module.exports = {
    getUsers,
    getUserById,
    suspendUser,
    unsuspendUser,
    deleteUser,
    updateUserRole,
    getStats,
};
