const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Counselor:
 *       type: object
 *       required:
 *         - name
 *         - specialization
 *         - experience
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated unique identifier
 *         name:
 *           type: string
 *           description: Counselor's full name
 *         specialization:
 *           type: string
 *           enum: [career, mental_health, relationship, academic, substance_abuse, family]
 *           description: Counselor's area of specialization
 *         experience:
 *           type: number
 *           description: Years of experience
 *         qualifications:
 *           type: array
 *           items:
 *             type: string
 *           description: List of qualifications
 *         bio:
 *           type: string
 *           description: Counselor's biography
 *         rating:
 *           type: number
 *           minimum: 0
 *           maximum: 5
 *           description: Average rating
 *         totalSessions:
 *           type: number
 *           description: Total sessions completed
 *         languages:
 *           type: array
 *           items:
 *             type: string
 *           description: Languages spoken
 *         availability:
 *           type: object
 *           properties:
 *             days:
 *               type: array
 *               items:
 *                 type: string
 *                 enum: [monday, tuesday, wednesday, thursday, friday, saturday, sunday]
 *             timeSlots:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   start:
 *                     type: string
 *                   end:
 *                     type: string
 *         pricing:
 *           type: object
 *           properties:
 *             perSession:
 *               type: number
 *             currency:
 *               type: string
 *               default: USD
 *         isActive:
 *           type: boolean
 *           description: Whether counselor is currently available
 *         profilePicture:
 *           type: string
 *           description: URL to profile picture
 */

const counselorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Counselor name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  specialization: {
    type: String,
    required: [true, 'Specialization is required'],
    enum: {
      values: ['career', 'mental_health', 'relationship', 'academic', 'substance_abuse', 'family'],
      message: 'Invalid specialization'
    },
    lowercase: true
  },
  experience: {
    type: Number,
    required: [true, 'Experience is required'],
    min: [0, 'Experience cannot be negative'],
    max: [50, 'Experience cannot exceed 50 years']
  },
  qualifications: [{
    type: String,
    trim: true
  }],
  bio: {
    type: String,
    maxlength: [1000, 'Bio cannot exceed 1000 characters'],
    trim: true
  },
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be less than 0'],
    max: [5, 'Rating cannot exceed 5']
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  totalSessions: {
    type: Number,
    default: 0
  },
  languages: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  availability: {
    days: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      lowercase: true
    }],
    timeSlots: [{
      start: {
        type: String,
        match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format. Use HH:MM format']
      },
      end: {
        type: String,
        match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format. Use HH:MM format']
      }
    }]
  },
  pricing: {
    perSession: {
      type: Number,
      min: [0, 'Price cannot be negative']
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  profilePicture: {
    type: String,
    default: null
  },
  contactInfo: {
    email: {
      type: String,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: String
  },
  certifications: [{
    name: String,
    issuer: String,
    dateObtained: Date,
    expiryDate: Date
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for formatted experience
counselorSchema.virtual('experienceFormatted').get(function() {
  return `${this.experience} year${this.experience !== 1 ? 's' : ''} of experience`;
});

// Virtual for specialization display
counselorSchema.virtual('specializationFormatted').get(function() {
  return this.specialization.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
});

// Indexes for better query performance
counselorSchema.index({ specialization: 1 });
counselorSchema.index({ rating: -1 });
counselorSchema.index({ isActive: 1 });
counselorSchema.index({ 'availability.days': 1 });

// Method to update rating
counselorSchema.methods.updateRating = function(newRating) {
  const totalRating = (this.rating * this.totalReviews) + newRating;
  this.totalReviews += 1;
  this.rating = totalRating / this.totalReviews;
  return this.save();
};

// Static method to find by specialization
counselorSchema.statics.findBySpecialization = function(specialization) {
  return this.find({ 
    specialization: specialization.toLowerCase(),
    isActive: true 
  }).sort({ rating: -1 });
};

// Static method to find available counselors
counselorSchema.statics.findAvailable = function(day, timeSlot) {
  const query = { isActive: true };
  
  if (day) {
    query['availability.days'] = day.toLowerCase();
  }
  
  return this.find(query).sort({ rating: -1 });
};

module.exports = mongoose.model('Counselor', counselorSchema);