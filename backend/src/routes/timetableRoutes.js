const express = require('express');
const controller = require('../controllers/timetableController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();
router.use(protect, adminOnly);

router.get('/', controller.list);
router.post('/generate', controller.generate);
router.delete('/', controller.clear);
router.put('/:id', controller.updateCell);

module.exports = router;
