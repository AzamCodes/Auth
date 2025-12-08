const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    token: { type: String, required: true, unique: true },
    deviceInfo: { browser: String, os: String, platform: String, source: String },
    ipAddress: String,
    expiresAt: { type: Date, required: true },
    isRevoked: { type: Boolean, default: false },
    revokedAt: Date,
}, { timestamps: true });

// Indexes
refreshTokenSchema.index({ userId: 1 });
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

/**
 * Check if token is expired
 * @returns {boolean}
 */
refreshTokenSchema.methods.isExpired = function () {
    return this.expiresAt < Date.now();
};

/**
 * Check if token is valid
 * @returns {boolean}
 */
refreshTokenSchema.methods.isValid = function () {
    return !this.isRevoked && !this.isExpired();
};

/**
 * Revoke token
 * @returns {Promise<void>}
 */
refreshTokenSchema.methods.revoke = async function () {
    this.isRevoked = true;
    this.revokedAt = Date.now();
    return this.save();
};

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);