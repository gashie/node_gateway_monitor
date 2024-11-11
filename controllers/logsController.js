// controllers/logController.js
const { getLogsByPeriod } = require('../models/monitorModel');

const getLogs = (req, res) => {
  const { startTime, endTime } = req.query;
  
  if (!startTime || !endTime) {
    return res.status(400).json({ error: 'Please provide both startTime and endTime' });
  }

  getLogsByPeriod(startTime, endTime, (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Failed to retrieve logs' });
    } else {
      res.json(rows);
    }
  });
};

module.exports = { getLogs };
