const express = require('express');
const { query, validationResult } = require('express-validator');
const Counselor = require('../models/Counselor');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/counselor/list:
 *   get:
 *     summary: Get list of counselors
 *     tags: [Counselor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: specialization
 *         schema:
 *           type: string
 *           enum: [career, mental_health, relationship, academic, substance_abuse, family]
 *         description: Filter by specialization
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Number of counselors per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [rating, experience, name]
 *           default: rating
 *         description: Sort by field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: List of counselors retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     counselors:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Counselor'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         totalCounselors:
 *                           type: integer
 *                         hasNextPage:
 *                           type: boolean
 *                         hasPrevPage:
 *                           type: boolean
 */
router.get('/list', auth, [
  query('specialization').optional().isIn(['career', 'mental_health', 'relationship', 'academic', 'substance_abuse', 'family']).withMessage('Invalid specialization'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('sortBy').optional().isIn(['rating', 'experience', 'name']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      specialization,
      page = 1,
      limit = 10,
      sortBy = 'rating',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = { isActive: true };
    if (specialization) {
      query.specialization = specialization.toLowerCase();
    }

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // If sorting by rating, add secondary sort by totalReviews
    if (sortBy === 'rating') {
      sortObj.totalReviews = -1;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const [counselors, total] = await Promise.all([
      Counselor.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Counselor.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));
    const currentPage = parseInt(page);

    res.json({
      status: 'success',
      data: {
        counselors,
        pagination: {
          currentPage,
          totalPages,
          totalCounselors: total,
          hasNextPage: currentPage < totalPages,
          hasPrevPage: currentPage > 1,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get counselors error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/counselor/{id}:
 *   get:
 *     summary: Get counselor details by ID
 *     tags: [Counselor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Counselor ID
 *     responses:
 *       200:
 *         description: Counselor details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     counselor:
 *                       $ref: '#/components/schemas/Counselor'
 *       404:
 *         description: Counselor not found
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const counselor = await Counselor.findById(id);
    if (!counselor) {
      return res.status(404).json({
        status: 'error',
        message: 'Counselor not found'
      });
    }

    res.json({
      status: 'success',
      data: {
        counselor
      }
    });
  } catch (error) {
    console.error('Get counselor error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid counselor ID'
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/counselor/specializations:
 *   get:
 *     summary: Get all available specializations
 *     tags: [Counselor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Specializations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     specializations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           value:
 *                             type: string
 *                           label:
 *                             type: string
 *                           count:
 *                             type: integer
 */
router.get('/specializations', auth, async (req, res) => {
  try {
    const specializations = await Counselor.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$specialization',
          count: { $sum: 1 },
          averageRating: { $avg: '$rating' }
        }
      },
      {
        $project: {
          value: '$_id',
          label: {
            $switch: {
              branches: [
                { case: { $eq: ['$_id', 'career'] }, then: 'Career Counseling' },
                { case: { $eq: ['$_id', 'mental_health'] }, then: 'Mental Health' },
                { case: { $eq: ['$_id', 'relationship'] }, then: 'Relationship Counseling' },
                { case: { $eq: ['$_id', 'academic'] }, then: 'Academic Counseling' },
                { case: { $eq: ['$_id', 'substance_abuse'] }, then: 'Substance Abuse' },
                { case: { $eq: ['$_id', 'family'] }, then: 'Family Counseling' }
              ],
              default: '$_id'
            }
          },
          count: 1,
          averageRating: { $round: ['$averageRating', 1] }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      status: 'success',
      data: {
        specializations
      }
    });
  } catch (error) {
    console.error('Get specializations error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/counselor/search:
 *   get:
 *     summary: Search counselors
 *     tags: [Counselor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query (name, bio, qualifications)
 *       - in: query
 *         name: specialization
 *         schema:
 *           type: string
 *         description: Filter by specialization
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: number
 *           minimum: 0
 *           maximum: 5
 *         description: Minimum rating filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Maximum price per session
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *         description: Filter by language
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *     responses:
 *       200:
 *         description: Search results
 */
router.get('/search', auth, [
  query('q').optional().isLength({ min: 1 }).withMessage('Search query cannot be empty'),
  query('minRating').optional().isFloat({ min: 0, max: 5 }).withMessage('Rating must be between 0 and 5'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Price must be positive'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      q,
      specialization,
      minRating,
      maxPrice,
      language,
      page = 1,
      limit = 10
    } = req.query;

    // Build query
    const query = { isActive: true };

    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { bio: { $regex: q, $options: 'i' } },
        { qualifications: { $regex: q, $options: 'i' } }
      ];
    }

    if (specialization) {
      query.specialization = specialization.toLowerCase();
    }

    if (minRating) {
      query.rating = { $gte: parseFloat(minRating) };
    }

    if (maxPrice) {
      query['pricing.perSession'] = { $lte: parseFloat(maxPrice) };
    }

    if (language) {
      query.languages = { $in: [language.toLowerCase()] };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute search
    const [counselors, total] = await Promise.all([
      Counselor.find(query)
        .sort({ rating: -1, totalReviews: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Counselor.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      status: 'success',
      data: {
        counselors,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCounselors: total,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        },
        searchQuery: q || null
      }
    });
  } catch (error) {
    console.error('Search counselors error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

module.exports = router;