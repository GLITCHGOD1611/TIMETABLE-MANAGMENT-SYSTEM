const express = require('express');
const controller = require('../controllers/dashboardController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();
router.use(protect, adminOnly);
router.get('/', controller.summary);

module.exports = router;
