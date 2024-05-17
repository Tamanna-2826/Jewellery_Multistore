const express = require('express');
const router = express.Router();

const { getCities, getStates } = require('../controllers/locationController');

router.get('/cities/:state_id',getCities);
router.get('/states', getStates);

module.exports = router;
