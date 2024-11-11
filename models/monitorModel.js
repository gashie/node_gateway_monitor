// models/monitorModel.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('monitors.db');

// Initialize tables if they do not exist
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS monitors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT,
      host TEXT,
      port INTEGER,
      url TEXT,
      username TEXT,
      password TEXT,
      schedule INTEGER,
      timeout INTEGER,
      start BOOLEAN DEFAULT FALSE,
      status TEXT DEFAULT 'UNKNOWN'
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      monitorId INTEGER,
      serviceName TEXT,
      priority INTEGER,
      alertTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (monitorId) REFERENCES monitors(id)
    )
  `);
});

// Function to get all active monitors (those set to start = true)
const getActiveMonitors = (callback) => {
  db.all("SELECT * FROM monitors WHERE start = 1", callback);
};

// Function to save a new monitor
const saveMonitor = (monitor, callback) => {
  const { type, host, port, url, username, password, schedule, timeout, start } = monitor;
  db.run(
    `INSERT INTO monitors (type, host, port, url, username, password, schedule, timeout, start)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [type, host, port, url, username, password, schedule, timeout, start ? 1 : 0],
    callback
  );
};

// Function to delete a monitor by ID
const deleteMonitorById = (id, callback) => {
  db.run(`DELETE FROM monitors WHERE id = ?`, [id], callback);
};

// Function to get all monitors with their statuses
const getAllMonitors = (callback) => {
  db.all("SELECT * FROM monitors", callback);
};

// Function to update monitor status
const updateMonitorStatus = (id, status, callback) => {
  db.run(`UPDATE monitors SET status = ? WHERE id = ?`, [status, id], callback);
};

// Alert management functions
const createAlert = (monitorId, serviceName, priority, callback) => {
  db.run(
    `INSERT INTO alerts (monitorId, serviceName, priority) VALUES (?, ?, ?)`,
    [monitorId, serviceName, priority],
    callback
  );
};

const clearAlert = (monitorId, callback) => {
  db.run(`DELETE FROM alerts WHERE monitorId = ?`, [monitorId], callback);
};

const getAlerts = (callback) => {
  db.all("SELECT * FROM alerts", callback);
};

module.exports = {
  getActiveMonitors,
  saveMonitor,
  deleteMonitorById,
  getAllMonitors,
  updateMonitorStatus,
  createAlert,
  clearAlert,
  getAlerts
};
