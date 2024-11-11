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
      status TEXT DEFAULT 'UNKNOWN',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

  db.run(`
    CREATE TABLE IF NOT EXISTS monitor_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      monitorId INTEGER,
      status TEXT,
      error TEXT,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (monitorId) REFERENCES monitors(id)
    )
  `);
});

// Functions to handle database interactions

const getActiveMonitors = (callback) => {
  db.all("SELECT * FROM monitors WHERE start = 1", callback);
};

const saveMonitor = (monitor, callback) => {
  const { type, host, port, url, username, password, schedule, timeout, start } = monitor;
  db.run(
    `INSERT INTO monitors (type, host, port, url, username, password, schedule, timeout, start)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [type, host, port, url, username, password, schedule, timeout, start ? 1 : 0],
    callback
  );
};

const deleteMonitorById = (id, callback) => {
  db.run(`DELETE FROM monitors WHERE id = ?`, [id], callback);
};

const getAllMonitors = (callback) => {
  db.all("SELECT * FROM monitors", callback);
};

// Update monitor status and update `updated_at` timestamp
const updateMonitorStatus = (id, status, callback) => {
  db.run(
    `UPDATE monitors SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [status, id],
    callback
  );
};

// Create an entry in the monitor logs table
const addMonitorLog = (monitorId, status, error, callback) => {
  db.run(
    `INSERT INTO monitor_logs (monitorId, status, error) VALUES (?, ?, ?)`,
    [monitorId, status, error],
    callback
  );
};

// Get logs within a specified time range
const getLogsByPeriod = (startTime, endTime, callback) => {
  db.all(
    `SELECT * FROM monitor_logs WHERE timestamp BETWEEN ? AND ?`,
    [startTime, endTime],
    callback
  );
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

// Function to retrieve all alerts
const getAllAlerts = (callback) => {
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
  getAlerts,
  getLogsByPeriod,
  addMonitorLog,
  getAllAlerts
};
