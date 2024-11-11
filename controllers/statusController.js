// controllers/statusController.js
const { activeStatuses } = require('../services/monitorService');

const getRealTimeStatuses = (req, res) => {
  const detailedStatuses = Object.values(activeStatuses); // Convert to an array for easier viewing
  res.json(detailedStatuses);
};

module.exports = { getRealTimeStatuses };
