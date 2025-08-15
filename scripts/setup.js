const mongoose = require('mongoose');
const Counselor = require('../models/Counselor');
require('dotenv').config();

// Sample counselor data
const sampleCounselors = [
  {
    name: 'Dr. Sarah Johnson',
    specialization: 'career',
    experience: 8,
    qualifications: ['PhD in Psychology', 'Certified Career Counselor', 'Executive Coach'],
    bio: 'Dr. Sarah Johnson is a dedicated career counselor with over 8 years of experience helping professionals navigate career transitions, develop leadership skills, and achieve their professional goals.',
    rating: 4.8,
    totalReviews: 127,
    totalSessions: 450,
    languages: ['english', 'spanish'],
    availability: {
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      timeSlots: [
        { start: '09:00', end: '17:00' }
      ]
    },
    pricing: {
      perSession: 120,
      currency: 'USD'
    },
    contactInfo: {
      email: 'sarah.johnson@counselor.com',
      phone: '+1-555-0101'
    },
    certifications: [
      {
        name: 'Certified Professional Career Counselor',
        issuer: 'National Career Development Association',
        dateObtained: new Date('2018-06-15')
      }
    ]
  },
  {
    name: 'Dr. Michael Chen',
    specialization: 'mental_health',
    experience: 12,
    qualifications: ['MD Psychiatry', 'Licensed Clinical Psychologist', 'CBT Specialist'],
    bio: 'Dr. Michael Chen specializes in anxiety, depression, and stress management. He uses evidence-based approaches including CBT and mindfulness techniques.',
    rating: 4.9,
    totalReviews: 89,
    totalSessions: 380,
    languages: ['english', 'mandarin'],
    availability: {
      days: ['monday', 'wednesday', 'friday', 'saturday'],
      timeSlots: [
        { start: '10:00', end: '18:00' }
      ]
    },
    pricing: {
      perSession: 150,
      currency: 'USD'
    },
    contactInfo: {
      email: 'michael.chen@counselor.com',
      phone: '+1-555-0102'
    }
  },
  {
    name: 'Dr. Emma Rodriguez',
    specialization: 'relationship',
    experience: 6,
    qualifications: ['MA in Marriage and Family Therapy', 'Licensed Marriage Counselor'],
    bio: 'Dr. Emma Rodriguez helps couples and individuals build stronger relationships through communication skills, conflict resolution, and emotional intelligence.',
    rating: 4.7,
    totalReviews: 156,
    totalSessions: 320,
    languages: ['english', 'spanish'],
    availability: {
      days: ['tuesday', 'thursday', 'saturday', 'sunday'],
      timeSlots: [
        { start: '11:00', end: '19:00' }
      ]
    },
    pricing: {
      perSession: 100,
      currency: 'USD'
    },
    contactInfo: {
      email: 'emma.rodriguez@counselor.com',
      phone: '+1-555-0103'
    }
  },
  {
    name: 'Dr. James Wilson',
    specialization: 'academic',
    experience: 10,
    qualifications: ['PhD in Educational Psychology', 'Academic Success Coach'],
    bio: 'Dr. James Wilson specializes in helping students overcome academic challenges, develop effective study strategies, and manage academic stress.',
    rating: 4.6,
    totalReviews: 203,
    totalSessions: 540,
    languages: ['english'],
    availability: {
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      timeSlots: [
        { start: '14:00', end: '20:00' }
      ]
    },
    pricing: {
      perSession: 80,
      currency: 'USD'
    },
    contactInfo: {
      email: 'james.wilson@counselor.com',
      phone: '+1-555-0104'
    }
  },
  {
    name: 'Dr. Lisa Thompson',
    specialization: 'family',
    experience: 15,
    qualifications: ['PhD in Family Psychology', 'Licensed Family Therapist', 'Child Psychology Specialist'],
    bio: 'Dr. Lisa Thompson has extensive experience in family therapy, child psychology, and helping families navigate difficult transitions and conflicts.',
    rating: 4.9,
    totalReviews: 95,
    totalSessions: 420,
    languages: ['english', 'french'],
    availability: {
      days: ['monday', 'wednesday', 'friday', 'saturday'],
      timeSlots: [
        { start: '09:00', end: '17:00' }
      ]
    },
    pricing: {
      perSession: 140,
      currency: 'USD'
    },
    contactInfo: {
      email: 'lisa.thompson@counselor.com',
      phone: '+1-555-0105'
    }
  },
  {
    name: 'Dr. Robert Martinez',
    specialization: 'substance_abuse',
    experience: 9,
    qualifications: ['MA in Addiction Counseling', 'Certified Addiction Counselor', 'EMDR Therapist'],
    bio: 'Dr. Robert Martinez specializes in addiction recovery, trauma therapy, and helping individuals build sustainable recovery practices.',
    rating: 4.8,
    totalReviews: 78,
    totalSessions: 290,
    languages: ['english', 'spanish'],
    availability: {
      days: ['tuesday', 'thursday', 'friday', 'sunday'],
      timeSlots: [
        { start: '10:00', end: '18:00' }
      ]
    },
    pricing: {
      perSession: 110,
      currency: 'USD'
    },
    contactInfo: {
      email: 'robert.martinez@counselor.com',
      phone: '+1-555-0106'
    }
  },
  {
    name: 'Dr. Priya Patel',
    specialization: 'career',
    experience: 7,
    qualifications: ['MBA', 'Certified Life Coach', 'Career Transition Specialist'],
    bio: 'Dr. Priya Patel helps professionals make successful career transitions, develop leadership skills, and achieve work-life balance.',
    rating: 4.7,
    totalReviews: 142,
    totalSessions: 380,
    languages: ['english', 'hindi'],
    availability: {
      days: ['monday', 'tuesday', 'wednesday', 'thursday'],
      timeSlots: [
        { start: '08:00', end: '16:00' }
      ]
    },
    pricing: {
      perSession: 95,
      currency: 'USD'
    },
    contactInfo: {
      email: 'priya.patel@counselor.com',
      phone: '+1-555-0107'
    }
  },
  {
    name: 'Dr. David Kim',
    specialization: 'mental_health',
    experience: 11,
    qualifications: ['PhD in Clinical Psychology', 'PTSD Specialist', 'Mindfulness Instructor'],
    bio: 'Dr. David Kim specializes in trauma therapy, PTSD treatment, and mindfulness-based interventions for anxiety and depression.',
    rating: 4.9,
    totalReviews: 67,
    totalSessions: 310,
    languages: ['english', 'korean'],
    availability: {
      days: ['monday', 'wednesday', 'friday', 'sunday'],
      timeSlots: [
        { start: '12:00', end: '20:00' }
      ]
    },
    pricing: {
      perSession: 160,
      currency: 'USD'
    },
    contactInfo: {
      email: 'david.kim@counselor.com',
      phone: '+1-555-0108'
    }
  }
];

async function setupDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Clear existing counselors
    await Counselor.deleteMany({});
    console.log('Cleared existing counselors');

    // Insert sample counselors
    const insertedCounselors = await Counselor.insertMany(sampleCounselors);
    console.log(`Inserted ${insertedCounselors.length} counselors`);

    console.log('Database setup completed successfully!');
    
    // Display inserted counselors
    console.log('\nInserted Counselors:');
    insertedCounselors.forEach((counselor, index) => {
      console.log(`${index + 1}. ${counselor.name} - ${counselor.specializationFormatted} (Rating: ${counselor.rating})`);
    });

  } catch (error) {
    console.error('Database setup failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase, sampleCounselors };