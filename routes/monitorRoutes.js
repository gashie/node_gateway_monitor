// routes/monitorRoutes.js
const express = require('express');
const router = express.Router();
const {
  addMonitor,
  getMonitorStatus,
  deleteMonitor,
  listMonitors,
  addAndGetHealthStatus,
  getSystemAlerts
} = require('../controllers/monitorController');
const { getRealTimeStatuses } = require('../controllers/statusController');
const { checkMonitor } = require('../controllers/checkMonitorController');

router.get('/realtime-status', getRealTimeStatuses);
router.post('/check-monitor', checkMonitor);
router.post('/monitors', addMonitor);
router.get('/monitors/status', getMonitorStatus);
router.delete('/monitors/:id', deleteMonitor);
router.get('/monitors', listMonitors);
router.post('/monitors/health', addAndGetHealthStatus);
router.get('/alerts', getSystemAlerts);

module.exports = router;
