// services/monitorService.js
const { getActiveMonitors, updateMonitorStatus } = require('../models/monitorModel');
const monitors = require('./monitors');

let activeMonitors = [];
let monitorIntervals = {}; // Track intervals by monitor ID
let activeStatuses = {}; // Store full monitor details by ID

// Initialize and start monitoring all active monitors from the database
async function initializeMonitors() {
  getActiveMonitors((err, rows) => {
    if (err) throw err;
    activeMonitors = rows;

    activeMonitors.forEach((monitor) => {
      if (monitor && monitors[monitor.type]) {
        // Start monitoring and save the interval ID
        const intervalId = monitors[monitor.type](monitor, handleStatusChange);
        monitorIntervals[monitor.id] = intervalId;

        // Store the entire monitor object in activeStatuses
        activeStatuses[monitor.id] = { ...monitor };
      } else {
        console.warn(`Skipped invalid monitor configuration: ${JSON.stringify(monitor)}`);
      }
    });
  });
}

// Handle status change, updating in-memory status and database only if necessary
function handleStatusChange(monitorId, newStatus) {
  const currentStatus = activeStatuses[monitorId]?.status;
  if (currentStatus !== newStatus) {
    // Update the in-memory status and `updated_at` timestamp
    activeStatuses[monitorId] = {
      ...activeStatuses[monitorId],
      status: newStatus,
      updated_at: new Date().toISOString(),
    };

    // Update the database with the new status
    updateMonitorStatus(monitorId, newStatus, (err) => {
      if (err) console.error(`Failed to update status for monitor ID ${monitorId}`);
    });
  }
}

// Clear a specific monitor's interval when deleted
function stopMonitorInterval(monitorId) {
  if (monitorIntervals[monitorId]) {
    clearInterval(monitorIntervals[monitorId]);
    delete monitorIntervals[monitorId];
    delete activeStatuses[monitorId];
  }
}

// Refresh in-memory monitors every 5 minutes to keep sync with the database
function refreshMonitors() {
  getActiveMonitors((err, rows) => {
    if (!err) {
      activeMonitors = rows;
      activeMonitors.forEach((monitor) => {
        if (monitor && monitorIntervals[monitor.id] === undefined && monitors[monitor.type]) {
          // Start monitoring and save the interval ID
          const intervalId = monitors[monitor.type](monitor, handleStatusChange);
          monitorIntervals[monitor.id] = intervalId;

          // Store the entire monitor object in activeStatuses
          activeStatuses[monitor.id] = { ...monitor };
        }
      });
    }
  });
}

setInterval(refreshMonitors, 5 * 60 * 1000);

module.exports = { initializeMonitors, refreshMonitors, stopMonitorInterval, activeStatuses };
