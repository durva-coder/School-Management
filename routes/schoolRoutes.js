const express = require('express');
const router = express.Router();
const {
  addSchoolValidation,
  addSchool,
  listSchoolsValidation,
  listSchools
} = require('../controllers/schoolController');

// POST /addSchool - Add a new school
router.post('/addSchool', addSchoolValidation, addSchool);

// GET /listSchools - List all schools sorted by proximity
router.get('/listSchools', listSchoolsValidation, listSchools);

module.exports = router;
