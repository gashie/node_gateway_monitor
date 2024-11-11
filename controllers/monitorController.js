// controllers/monitorController.js
const { saveMonitor, deleteMonitorById, getAllMonitors,getAlerts } = require('../models/monitorModel');
const { initializeMonitors, refreshMonitors,stopMonitorInterval } = require('../services/monitorService');

// Add a new monitor and start monitoring
const addMonitor = (req, res) => {
  const newMonitor = req.body;
  saveMonitor(newMonitor, (err) => {
    if (err) {
      res.status(500).json({ error: 'Failed to save monitor' });
    } else {
      initializeMonitors(); // Re-initialize monitors to add the new one
      res.status(201).json({ message: 'Monitor added successfully' });
    }
  });
};

// Get status of all monitors
const getMonitorStatus = (req, res) => {
  getAllMonitors((err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Failed to fetch monitor statuses' });
    } else {
      res.json(rows);
    }
  });
};

// Get status of all monitors
const getSystemAlerts = (req, res) => {
  getAlerts((err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Failed to fetch monitor statuses' });
    } else {
      res.json(rows);
    }
  });
};

// Delete a monitor by ID
const deleteMonitor = (req, res) => {
  const { id } = req.params;
  stopMonitorInterval(id); // Stop the monitoring interval before deletion
  deleteMonitorById(id, (err) => {
    if (err) {
      res.status(500).json({ error: 'Failed to delete monitor' });
    } else {
      initializeMonitors(); // Refresh monitors after deletion
      res.json({ message: 'Monitor deleted successfully' });
    }
  });
};

// List all monitors
const listMonitors = (req, res) => {
  getAllMonitors((err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Failed to fetch monitors' });
    } else {
      res.json(rows);
    }
  });
};

// Add and monitor a new monitor, returning its status
const addAndGetHealthStatus = (req, res) => {
  const newMonitor = req.body;
  saveMonitor(newMonitor, (err) => {
    if (err) {
      res.status(500).json({ error: 'Failed to save monitor' });
    } else {
      initializeMonitors();
      refreshMonitors();
      res.status(201).json({ message: 'Monitor added and monitoring started' });
    }
  });
};

module.exports = { addMonitor, getMonitorStatus, deleteMonitor, listMonitors, addAndGetHealthStatus,getSystemAlerts };
