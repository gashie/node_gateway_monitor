// services/monitorService.js
const { getActiveMonitors } = require('../models/monitorModel');
const monitors = require('./monitors');

async function initializeMonitors() {
  getActiveMonitors((err, rows) => {
    if (err) throw err;
    rows.forEach((monitor) => {
      const { type, host, port, url, username, password, schedule, timeout } = monitor;
      monitors[type](host, port, url, username, password, schedule, timeout);
    });
  });
}

module.exports = { initializeMonitors };
