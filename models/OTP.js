const mongoose = require('mongoose');
const crypto = require('crypto');

const otpSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  email: {
    type: String,
    required: function() {
      return this.type === 'email';
    },
    lowercase: true
  },
  phone: {
    type: String,
    required: function() {
      return this.type === 'phone';
    }
  },
  otp: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['email', 'phone'],
    required: true
  },
  purpose: {
    type: String,
    enum: ['verification', 'password_reset', 'login'],
    required: true
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  attempts: {
    type: Number,
    default: 0,
    max: [3, 'Maximum 3 attempts allowed']
  },
  expiresAt: {
    type: Date,
    required: true,
    default: function() {
      return new Date(Date.now() + (parseInt(process.env.OTP_EXPIRES_IN) || 300000));
    }
  }
}, {
  timestamps: true
});

// Index for automatic document removal
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpSchema.index({ userId: 1, type: 1, purpose: 1 });

// Generate random OTP
otpSchema.statics.generateOTP = function() {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Method to verify OTP
otpSchema.methods.verify = function(inputOTP) {
  if (this.isUsed) {
    throw new Error('OTP has already been used');
  }
  
  if (this.expiresAt < new Date()) {
    throw new Error('OTP has expired');
  }
  
  if (this.attempts >= 3) {
    throw new Error('Maximum attempts exceeded');
  }
  
  this.attempts += 1;
  
  if (this.otp !== inputOTP) {
    this.save();
    throw new Error('Invalid OTP');
  }
  
  this.isUsed = true;
  return this.save();
};

// Static method to create OTP
otpSchema.statics.createOTP = async function(userId, type, purpose, contact) {
  // Remove existing unused OTPs for the same purpose
  await this.deleteMany({
    userId,
    type,
    purpose,
    isUsed: false
  });
  
  const otp = this.generateOTP();
  const otpData = {
    userId,
    otp,
    type,
    purpose
  };
  
  if (type === 'email') {
    otpData.email = contact;
  } else {
    otpData.phone = contact;
  }
  
  return await this.create(otpData);
};

// Static method to find valid OTP
otpSchema.statics.findValidOTP = function(userId, type, purpose) {
  return this.findOne({
    userId,
    type,
    purpose,
    isUsed: false,
    expiresAt: { $gt: new Date() },
    attempts: { $lt: 3 }
  });
};

module.exports = mongoose.model('OTP', otpSchema);