// routes/monitorRoutes.js
const express = require('express');
const { addMonitor, getMonitorStatus } = require('../controllers/monitorController');
const router = express.Router();

router.post('/monitors', addMonitor);
router.get('/monitors/status', getMonitorStatus);

module.exports = router;
