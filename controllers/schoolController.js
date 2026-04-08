const { pool } = require('../database/config');
const { body, query, validationResult } = require('express-validator');

// Validation rules for adding a school
const addSchoolValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('School name is required')
    .isString().withMessage('School name must be a string')
    .isLength({ max: 255 }).withMessage('School name must be less than 255 characters'),
  
  body('address')
    .trim()
    .notEmpty().withMessage('Address is required')
    .isString().withMessage('Address must be a string')
    .isLength({ max: 500 }).withMessage('Address must be less than 500 characters'),
  
  body('latitude')
    .isFloat({ min: -90, max: 90 }).withMessage('Latitude must be a float between -90 and 90')
    .toFloat(),
  
  body('longitude')
    .isFloat({ min: -180, max: 180 }).withMessage('Longitude must be a float between -180 and 180')
    .toFloat()
];

// Add School API Controller
const addSchool = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, address, latitude, longitude } = req.body;

    // Insert school into database
    const query = `
      INSERT INTO schools (name, address, latitude, longitude)
      VALUES (?, ?, ?, ?)
    `;

    const [result] = await pool.execute(query, [name, address, latitude, longitude]);

    // Return success response
    res.status(201).json({
      success: true,
      message: 'School added successfully',
      data: {
        id: result.insertId,
        name,
        address,
        latitude,
        longitude
      }
    });

  } catch (error) {
    console.error('Error adding school:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Validation rules for listing schools
const listSchoolsValidation = [
  query('latitude')
    .isFloat({ min: -90, max: 90 }).withMessage('Latitude must be a float between -90 and 90')
    .toFloat(),
  
  query('longitude')
    .isFloat({ min: -180, max: 180 }).withMessage('Longitude must be a float between -180 and 180')
    .toFloat()
];

// List Schools API Controller with proximity sorting
const listSchools = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { latitude: userLat, longitude: userLon } = req.query;

    // Query to fetch all schools with calculated distance using Haversine formula
    // Distance is calculated in kilometers
    const query = `
      SELECT 
        id,
        name,
        address,
        latitude,
        longitude,
        (
          6371 * ACOS(
            COS(RADIANS(?)) * 
            COS(RADIANS(latitude)) * 
            COS(RADIANS(longitude) - RADIANS(?)) + 
            SIN(RADIANS(?)) * 
            SIN(RADIANS(latitude))
          )
        ) AS distance_km
      FROM schools
      ORDER BY distance_km ASC
    `;

    const [schools] = await pool.execute(query, [userLat, userLon, userLat]);

    // Return success response with sorted schools
    res.status(200).json({
      success: true,
      message: 'Schools retrieved successfully',
      count: schools.length,
      data: schools
    });

  } catch (error) {
    console.error('Error listing schools:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  addSchoolValidation,
  addSchool,
  listSchoolsValidation,
  listSchools
};
