// controllers/monitorController.js
const { saveMonitor } = require('../models/monitorModel');
const { initializeMonitors } = require('../services/monitorService');

const addMonitor = (req, res) => {
  const newMonitor = req.body;
  saveMonitor(newMonitor, (err) => {
    if (err) {
      res.status(500).json({ error: 'Failed to save monitor' });
    } else {
      initializeMonitors(); // Re-initialize monitors after adding a new one
      res.status(201).json({ message: 'Monitor added successfully' });
    }
  });
};

const getMonitorStatus = (req, res) => {
  // Logic to retrieve monitor status
  res.json({ message: 'Monitor status retrieved successfully' });
};

module.exports = { addMonitor, getMonitorStatus };
