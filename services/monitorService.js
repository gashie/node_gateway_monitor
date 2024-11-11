// services/monitorService.js
const { getActiveMonitors } = require('../models/monitorModel');
const monitors = require('./monitors');

let activeMonitors = [];
let monitorIntervals = {}; // Track intervals by monitor ID

// Initialize and start monitoring all active monitors from the database
async function initializeMonitors() {
  getActiveMonitors((err, rows) => {
    if (err) throw err;
    activeMonitors = rows;

    activeMonitors.forEach((monitor) => {
      if (monitor && monitors[monitor.type]) {
        // Start monitoring and save the interval ID
        const intervalId = monitors[monitor.type](monitor);
        monitorIntervals[monitor.id] = intervalId;
      } else {
        console.warn(`Skipped invalid monitor configuration: ${JSON.stringify(monitor)}`);
      }
    });
  });
}

// Clear a specific monitor's interval when deleted
function stopMonitorInterval(monitorId) {
  if (monitorIntervals[monitorId]) {
    clearInterval(monitorIntervals[monitorId]);
    delete monitorIntervals[monitorId];
  }
}

// Refresh in-memory monitors every 5 minutes to keep sync with the database
function refreshMonitors() {
  getActiveMonitors((err, rows) => {
    if (!err) {
      activeMonitors = rows;
    }
  });
}

setInterval(refreshMonitors, 5 * 60 * 1000);

module.exports = { initializeMonitors, refreshMonitors, stopMonitorInterval };
