// models/monitorModel.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('monitors.db');

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
    start BOOLEAN DEFAULT FALSE
  )
`);

module.exports = {
  getActiveMonitors: (callback) => {
    db.all("SELECT * FROM monitors WHERE start = 1", callback);
  },
  saveMonitor: (monitor, callback) => {
    const { type, host, port, url, username, password, schedule, timeout } = monitor;
    db.run(
      `INSERT INTO monitors (type, host, port, url, username, password, schedule, timeout, start)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [type, host, port, url, username, password, schedule, timeout, 1],
      callback
    );
  }
};
