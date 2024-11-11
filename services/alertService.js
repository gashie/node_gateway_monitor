// services/alertService.js
const { getAllAlerts, createAlert, clearAlert } = require('../models/monitorModel');

let alertCount = 0;
const maxAlerts = 5;
const alertCooldown = 2 * 60 * 1000;
let lastAlertTime = null;
const alertQueue = [];
let activeAlerts = []; // In-memory storage of active alerts

// Initialize alerts from database to memory on startup
function loadAlertsToMemory() {
  getAllAlerts((err, rows) => {
    if (err) {
      console.error('Failed to load alerts from database:', err);
    } else {
      activeAlerts = rows;
    }
  });
}

// Function to send an alert with priority and cooldown management
async function sendAlertWithPriority(serviceName, monitorId, priority = 1) {
  if (alertCount < maxAlerts) {
    if (priority === 1 || (lastAlertTime === null || Date.now() - lastAlertTime >= alertCooldown)) {
      console.log(`Alert sent for ${serviceName}`);
      lastAlertTime = Date.now();
      alertCount++;

      // Save alert in memory and database if it doesn't already exist
      if (!activeAlerts.some(alert => alert.monitorId === monitorId)) {
        activeAlerts.push({ monitorId, serviceName, priority });
        createAlert(monitorId, serviceName, priority, (err) => {
          if (err) {
            console.error('Failed to save alert to database:', err);
          }
        });
      }
    } else {
      alertQueue.push({ serviceName, monitorId, priority });
    }
  } else {
    // Set cooldown to reset alertCount and process queued alerts
    setTimeout(() => {
      alertCount = 0;
      sendQueuedAlerts();
    }, alertCooldown);
  }
}

// Function to process queued alerts
function sendQueuedAlerts() {
  if (alertQueue.length > 0) {
    const nextAlert = alertQueue.shift();
    sendAlertWithPriority(nextAlert.serviceName, nextAlert.monitorId, nextAlert.priority);
  }
}

// Function to clear an alert (both from memory and database) when the monitor is back "UP"
function clearAlertInMemory(monitorId) {
  // Check if there is an active alert before attempting to clear it
  const alertIndex = activeAlerts.findIndex(alert => alert.monitorId === monitorId);

  if (alertIndex !== -1) {
    // Remove from in-memory alerts
    activeAlerts.splice(alertIndex, 1);

    // Remove from database
    clearAlert(monitorId, (err) => {
      if (err) {
        console.error('Failed to clear alert from database:', err);
      } else {
        console.log(`Alert cleared for monitor ID ${monitorId}`);
      }
    });
  }
}

// Periodically synchronize alerts from database to memory (e.g., in case of external changes)
function refreshAlerts() {
  getAllAlerts((err, rows) => {
    if (err) {
      console.error('Failed to load alerts from database:', err);
    } else {
      activeAlerts = rows;
    }
  });
}

// Refresh alerts every 5 minutes
setInterval(refreshAlerts, 5 * 60 * 1000);

module.exports = { sendAlertWithPriority, clearAlert: clearAlertInMemory, loadAlertsToMemory };
