/**
 * Admin Routes
 * Defines admin-specific API endpoints
 */

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate } = require('../middleware/authenticate');
const { isAdmin } = require('../middleware/authorize');
const validate = require('../middleware/validate');
const {
    mongoIdValidation,
    updateRoleValidation,
    suspendUserValidation,
} = require('../utils/validators');

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(isAdmin);

// User management routes
router.get('/users', adminController.getUsers);
router.get('/users/:id', mongoIdValidation, validate, adminController.getUserById);
router.put(
    '/users/:id/suspend',
    mongoIdValidation,
    suspendUserValidation,
    validate,
    adminController.suspendUser
);
router.put('/users/:id/unsuspend', mongoIdValidation, validate, adminController.unsuspendUser);
router.delete('/users/:id', mongoIdValidation, validate, adminController.deleteUser);
router.put(
    '/users/:id/role',
    mongoIdValidation,
    updateRoleValidation,
    validate,
    adminController.updateUserRole
);

// System statistics
router.get('/stats', adminController.getStats);

module.exports = router;
