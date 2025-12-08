// /**
//  * User Model
//  * Represents a user in the authentication system
//  */

// const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');

// const userSchema = new mongoose.Schema(
//     {
//         name: {
//             type: String,
//             required: [true, 'Name is required'],
//             trim: true,
//             minlength: [2, 'Name must be at least 2 characters'],
//             maxlength: [50, 'Name cannot exceed 50 characters'],
//         },
//         email: {
//             type: String,
//             required: [true, 'Email is required'],
//             unique: true,
//             lowercase: true,
//             trim: true,
//             match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
//         },
//         password: {
//             type: String,
//             required: [true, 'Password is required'],
//             minlength: [8, 'Password must be at least 8 characters'],
//             select: false, // Don't include password in queries by default
//         },
//         role: {
//             type: String,
//             enum: ['user', 'admin'],
//             default: 'user',
//         },
//         profilePicture: {
//             type: String,
//             default: '',
//         },
//         isEmailVerified: {
//             type: Boolean,
//             default: false,
//         },
//         emailVerificationOTP: {
//             type: String,
//             select: false,
//         },
//         emailVerificationExpires: {
//             type: Date,
//             select: false,
//         },
//         passwordResetOTP: {
//             type: String,
//             select: false,
//         },
//         passwordResetExpires: {
//             type: Date,
//             select: false,
//         },
//         passwordResetToken: {
//             type: String,
//             select: false,
//         },
//         twoFactorSecret: {
//             type: String,
//             select: false,
//         },
//         twoFactorEnabled: {
//             type: Boolean,
//             default: false,
//         },
//         lastLogin: {
//             type: Date,
//         },
//         lastLoginDevice: {
//             type: String,
//         },
//         loginAttempts: {
//             type: Number,
//             default: 0,
//         },
//         lockUntil: {
//             type: Date,
//         },
//         isSuspended: {
//             type: Boolean,
//             default: false,
//         },
//         suspendedAt: {
//             type: Date,
//         },
//         suspendedBy: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: 'User',
//         },
//         suspensionReason: {
//             type: String,
//         },
//     },
//     {
//         timestamps: true,
//     }
// );

// // Index for faster queries
// userSchema.index({ email: 1 });
// userSchema.index({ role: 1 });
// userSchema.index({ isEmailVerified: 1 });

// /**
//  * Hash password before saving
//  */
// userSchema.pre('save', async function (next) {
//     // Only hash password if it's modified
//     if (!this.isModified('password')) {
//         return next();
//     }

//     try {
//         const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
//         this.password = await bcrypt.hash(this.password, saltRounds);
//         next();
//     } catch (error) {
//         next(error);
//     }
// });

// /**
//  * Compare password with hashed password
//  * @param {string} candidatePassword - Password to compare
//  * @returns {Promise<boolean>}
//  */
// userSchema.methods.comparePassword = async function (candidatePassword) {
//     try {
//         return await bcrypt.compare(candidatePassword, this.password);
//     } catch (error) {
//         throw new Error('Error comparing passwords');
//     }
// };

// /**
//  * Check if account is locked
//  * @returns {boolean}
//  */
// userSchema.methods.isLocked = function () {
//     return !!(this.lockUntil && this.lockUntil > Date.now());
// };

// /**
//  * Increment login attempts
//  * @returns {Promise<void>}
//  */
// userSchema.methods.incLoginAttempts = async function () {
//     // If we have a previous lock that has expired, restart at 1
//     if (this.lockUntil && this.lockUntil < Date.now()) {
//         return this.updateOne({
//             $set: { loginAttempts: 1 },
//             $unset: { lockUntil: 1 },
//         });
//     }

//     const updates = { $inc: { loginAttempts: 1 } };
//     const maxAttempts = 5;
//     const lockTime = 15 * 60 * 1000; // 15 minutes

//     // Lock the account if max attempts reached
//     if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked()) {
//         updates.$set = { lockUntil: Date.now() + lockTime };
//     }

//     return this.updateOne(updates);
// };

// /**
//  * Reset login attempts
//  * @returns {Promise<void>}
//  */
// userSchema.methods.resetLoginAttempts = async function () {
//     return this.updateOne({
//         $set: { loginAttempts: 0 },
//         $unset: { lockUntil: 1 },
//     });
// };

// /**
//  * Remove sensitive fields from JSON output
//  */
// userSchema.methods.toJSON = function () {
//     const obj = this.toObject();
//     delete obj.password;
//     delete obj.emailVerificationOTP;
//     delete obj.emailVerificationExpires;
//     delete obj.passwordResetOTP;
//     delete obj.passwordResetExpires;
//     delete obj.passwordResetToken;
//     delete obj.twoFactorSecret;
//     delete obj.__v;
//     return obj;
// };

// const User = mongoose.model('User', userSchema);

// module.exports = User;


// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,        // ← This automatically creates index
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        select: false,
    },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    profilePicture: { type: String, default: '' },
    isEmailVerified: { type: Boolean, default: false },

    // OTP fields
    emailVerificationOTP: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
    passwordResetOTP: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    passwordResetToken: { type: String, select: false },

    // 2FA & Security
    twoFactorSecret: { type: String, select: false },
    twoFactorEnabled: { type: Boolean, default: false },

    // Login tracking
    lastLogin: Date,
    lastLoginDevice: String,
    loginAttempts: { type: Number, default: 0 },
    lockUntil: Date,

    // Suspension
    isSuspended: { type: Boolean, default: false },
    suspendedAt: Date,
    suspendedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    suspensionReason: String,

}, { timestamps: true });

// ⚠️ REMOVE ALL THESE LINES BELOW - THEY CAUSE DUPLICATE INDEX WARNINGS
// userSchema.index({ email: 1 });        ← DELETE THIS
// userSchema.index({ role: 1 });         ← DELETE THIS  
// userSchema.index({ isEmailVerified: 1 }); ← DELETE THIS

// Only add extra indexes if you REALLY need them (you don't for now)

// Password hashing
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
        this.password = await bcrypt.hash(this.password, saltRounds);
        next();
    } catch (err) {
        next(err);
    }
});

// Methods
userSchema.methods.comparePassword = async function (pass) {
    return bcrypt.compare(pass, this.password);
};

userSchema.methods.isLocked = function () {
    return this.lockUntil && this.lockUntil > Date.now();
};

// Increment login attempts
userSchema.methods.incLoginAttempts = async function () {
    // If we have a previous lock that has expired, restart at 1
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.updateOne({
            $set: { loginAttempts: 1 },
            $unset: { lockUntil: 1 },
        });
    }

    const updates = { $inc: { loginAttempts: 1 } };
    const maxAttempts = 5;
    const lockTime = 15 * 60 * 1000; // 15 minutes

    // Lock the account if max attempts reached
    if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked()) {
        updates.$set = { lockUntil: Date.now() + lockTime };
    }

    return this.updateOne(updates);
};

// Reset login attempts
userSchema.methods.resetLoginAttempts = async function () {
    return this.updateOne({
        $set: { loginAttempts: 0 },
        $unset: { lockUntil: 1 },
    });
};

userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    delete obj.emailVerificationOTP;
    delete obj.emailVerificationExpires;
    delete obj.passwordResetOTP;
    delete obj.passwordResetExpires;
    delete obj.passwordResetToken;
    delete obj.twoFactorSecret;
    delete obj.__v;
    return obj;
};

module.exports = mongoose.model('User', userSchema);