# Counselor API - Mobile App Backend

A comprehensive Node.js API application with user authentication, OTP services, and counselor management features for mobile applications.

## 🚀 Features

### Authentication & Security
- User registration and login
- JWT-based authentication
- Email & SMS OTP verification
- Password reset with OTP
- Secure password hashing
- Rate limiting
- Input validation

### User Management
- User profile management
- Account activation/deactivation
- Password change functionality
- Profile picture support
- Preference settings

### Counselor Services
- Browse counselors by specialization
- Search and filter counselors
- Counselor profile details
- Rating and review system
- Availability management

### Specializations Supported
- Career Counseling
- Mental Health
- Relationship Counseling
- Academic Counseling
- Substance Abuse
- Family Counseling

## 📁 Project Structure

```
counselor-api/
├── models/
│   ├── User.js              # User model with authentication
│   ├── OTP.js               # OTP model for verification
│   └── Counselor.js         # Counselor model
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── user.js              # User management routes
│   └── counselor.js         # Counselor routes
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── utils/
│   └── notifications.js     # Email & SMS utilities
├── scripts/
│   └── setup.js             # Database setup script
├── .env                     # Environment variables
├── server.js                # Main server file
├── package.json             # Dependencies
└── README.md                # This file
```

## 🛠️ Installation & Setup

### 1. Clone and Install Dependencies

```bash
# Clone the repository (or create new directory)
mkdir counselor-api
cd counselor-api

# Copy all the provided files to this directory

# Install dependencies
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory and configure the following:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration (Free Tier)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/counselor-app?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Email Configuration (Gmail SMTP - Free)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Twilio Configuration (Free Trial)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# OTP Configuration
OTP_EXPIRES_IN=300000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
FRONTEND_URL=http://localhost:3001
```

### 3. Database Setup

#### MongoDB Atlas (Free Tier)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster
4. Get connection string and update `MONGODB_URI`

#### Setup Sample Data
```bash
node scripts/setup.js
```

### 4. Email Configuration (Gmail)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use the generated password in `EMAIL_PASS`

### 5. SMS Configuration (Twilio - Free)

1. Sign up at [Twilio](https://www.twilio.com/try-twilio)
2. Get free trial credits ($15)
3. Note your Account SID, Auth Token, and Phone Number
4. Update the Twilio variables in `.env`

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3000`

## 📚 API Documentation

### Swagger Documentation
Visit `http://localhost:3000/api-docs` for interactive API documentation.

### Base URL
```
http://localhost:3000/api
```

### Authentication
Most endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 🔑 API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | No |
| POST | `/login` | User login | No |
| POST | `/forgot-password` | Request password reset OTP | No |
| POST | `/reset-password` | Reset password with OTP | No |
| POST | `/verify-email` | Verify email with OTP | Yes |
| POST | `/send-phone-otp` | Send OTP to phone | Yes |
| POST | `/verify-phone` | Verify phone with OTP | Yes |
| GET | `/me` | Get current user profile | Yes |

### User Routes (`/api/user`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/profile` | Get user profile | Yes |
| PUT | `/profile` | Update user profile | Yes |
| PUT | `/change-password` | Change password | Yes |
| PUT | `/deactivate` | Deactivate account | Yes |
| DELETE | `/delete` | Delete account permanently | Yes |

### Counselor Routes (`/api/counselor`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/list` | Get counselors list | Yes |
| GET | `/:id` | Get counselor details | Yes |
| GET | `/specializations` | Get all specializations | Yes |
| GET | `/search` | Search counselors | Yes |

## 📱 Mobile App Integration Examples

### 1. User Registration
```javascript
const response = await fetch('http://localhost:3000/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1234567890'
  })
});

const data = await response.json();
// Store token: data.data.token
```

### 2. User Login
```javascript
const response = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const data = await response.json();
// Store token: data.data.token
```

### 3. Get Counselors
```javascript
const response = await fetch('http://localhost:3000/api/counselor/list?specialization=career&page=1&limit=10', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
});

const data = await response.json();
// Use data.data.counselors
```

### 4. Verify Email OTP
```javascript
const response = await fetch('http://localhost:3000/api/auth/verify-email', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    otp: '123456'
  })
});
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Prevents API abuse
- **Input Validation**: Express-validator for request validation
- **CORS Protection**: Configurable CORS settings
- **Helmet**: Security headers
- **OTP Expiration**: Time-limited OTP codes
- **Attempt Limiting**: Maximum 3 OTP attempts

## 📊 Database Models

### User Model
```javascript
{
  email: String (unique, required),
  password: String (hashed, required),
  firstName: String (required),
  lastName: String (required),
  phone: String,
  dateOfBirth: Date,
  gender: String,
  isEmailVerified: Boolean,
  isPhoneVerified: Boolean,
  isActive: Boolean,
  profilePicture: String,
  preferences: {
    notifications: Boolean,
    language: String
  },
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### OTP Model
```javascript
{
  userId: ObjectId (ref: User),
  email: String,
  phone: String,
  otp: String (6 digits),
  type: String (email/phone),
  purpose: String (verification/password_reset/login),
  isUsed: Boolean,
  attempts: Number (max: 3),
  expiresAt: Date (5 minutes),
  createdAt: Date
}
```

### Counselor Model
```javascript
{
  name: String (required),
  specialization: String (required),
  experience: Number (required),
  qualifications: [String],
  bio: String,
  rating: Number (0-5),
  totalReviews: Number,
  totalSessions: Number,
  languages: [String],
  availability: {
    days: [String],
    timeSlots: [{ start: String, end: String }]
  },
  pricing: {
    perSession: Number,
    currency: String
  },
  isActive: Boolean,
  profilePicture: String,
  contactInfo: {
    email: String,
    phone: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

## 🚀 Deployment Options

### 1. Free Hosting Options
- **Render**: Connect GitHub repo for auto-deploy
- **Railway**: Simple deployment with database
- **Heroku**: Free tier with add-ons
- **Vercel**: For serverless deployment

### 2. Database Options
- **MongoDB Atlas**: Free 512MB cluster
- **PlanetScale**: Free MySQL database
- **Supabase**: Free PostgreSQL database

### 3. Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=super-secure-production-secret
# ... other production values
```

## 🧪 Testing the API

### Using curl
```bash
# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","firstName":"Test","lastName":"User"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get counselors (replace TOKEN with actual JWT)
curl -X GET http://localhost:3000/api/counselor/list \
  -H "Authorization: Bearer TOKEN"
```

### Using Postman
1. Import the API documentation from `/api-docs`
2. Set up environment variables for base URL and token
3. Test all endpoints systematically

## 📈 Performance & Scaling

### Implemented Optimizations
- Database indexing for faster queries
- Pagination for large datasets
- Rate limiting to prevent abuse
- Efficient password hashing
- Lean queries for better performance

### Scaling Considerations
- Use Redis for session storage
- Implement caching layers
- Set up load balancing
- Monitor with tools like New Relic
- Use CDN for static assets

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   ```
   Error: MongoNetworkError
   ```
   - Check if MONGODB_URI is correct
   - Verify network access in MongoDB Atlas
   - Ensure IP address is whitelisted

2. **Email/SMS Not Sending**
   - Check credentials in .env file
   - Verify Gmail app password setup
   - Check Twilio account balance

3. **JWT Token Errors**
   ```
   Error: JsonWebTokenError: invalid token
   ```
   - Verify JWT_SECRET matches between requests
   - Check token expiration
   - Ensure proper Authorization header format

4. **Port Already in Use**
   ```
   Error: EADDRINUSE: address already in use :::3000
   ```
   - Change PORT in .env file
   - Kill process using the port: `lsof -ti:3000 | xargs kill -9`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation at `/api-docs`
- Review the troubleshooting section above

## 🔄 Version History

- **v1.0.0**: Initial release with core features
  - User authentication
  - OTP verification
  - Counselor management
  - Swagger documentation

---

**Ready to use!** Your Node.js API is now set up with all the features requested for your mobile app backend.# Counselor API - Mobile App Backend

A comprehensive Node.js API application with user authentication, OTP services, and counselor management features for mobile applications.

## 🚀 Features

### Authentication & Security
- User registration and login
- JWT-based authentication
- Email & SMS OTP verification
- Password reset with OTP
- Secure password hashing
- Rate limiting
- Input validation

### User Management
- User