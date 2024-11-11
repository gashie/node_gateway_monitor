// services/monitors/httpMonitor.js
const axios = require('axios');
const { sendAlertWithPriority, clearAlert } = require('../alertService');
const { addMonitorLog } = require('../../models/monitorModel');

module.exports = (monitor, handleStatusChange) => {
  if (!monitor || !monitor.url) {
    console.warn('Invalid monitor configuration passed to HTTP monitor:', monitor);
    return;
  }

  const { id, url, schedule } = monitor;
  let previousStatus = 'UNKNOWN';

  const intervalId = setInterval(async () => {
    try {
      const response = await axios.get(url);
      const status = response.status === 200 ? 'UP' : 'DOWN';

      if (status !== previousStatus) {
        handleStatusChange(id, status); // Update status via monitorService
        if (status === 'UP') {
          clearAlert(id);
        } else {
          sendAlertWithPriority(`HTTP Monitor - URL: ${url} is down`, id, 2);
        }
        previousStatus = status;
      }

      // Log the monitoring check
      addMonitorLog(id, status, null, (err) => {
        if (err) console.error(`Failed to log monitoring check for monitor ID ${id}`);
      });
    } catch (error) {
      if (previousStatus !== 'DOWN') {
        handleStatusChange(id, 'DOWN'); // Update status to DOWN via monitorService
        sendAlertWithPriority(`HTTP Monitor - URL: ${url} is down`, id, 3);
        previousStatus = 'DOWN';
      }

      // Log the error
      addMonitorLog(id, 'DOWN', error.message, (err) => {
        if (err) console.error(`Failed to log error for monitor ID ${id}`);
      });
    }
  }, schedule * 1000);

  return intervalId;
};
