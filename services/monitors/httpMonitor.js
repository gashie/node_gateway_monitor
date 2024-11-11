// services/monitors/httpMonitor.js
const axios = require('axios');
const { sendAlertWithPriority, clearAlert } = require('../alertService');
const { updateMonitorStatus } = require('../../models/monitorModel');

module.exports = (monitor) => {
  if (!monitor || !monitor.url) {
    console.warn('Invalid monitor configuration passed to HTTP monitor:', monitor);
    return;
  }

  const { id, url, schedule } = monitor;
  let previousStatus = 'UNKNOWN';

  const intervalId = setInterval(async () => {
    try {
      const response = await axios.get(url);
      console.log(`HTTP Monitor - URL: ${url}, Status Code: ${response.status}`);
      
      if (response.status === 200) {
        if (previousStatus === 'DOWN') {
          updateMonitorStatus(id, 'UP', (err) => {
            if (err) console.error(`Failed to update status for monitor ID ${id}`);
          });
          clearAlert(id);
          console.log(`Alert cleared for monitor ID ${id}`);
        }
        previousStatus = 'UP';
      } else {
        if (previousStatus === 'UP') {
          sendAlertWithPriority(`HTTP Monitor - URL: ${url} is down`, id, 2);
          updateMonitorStatus(id, 'DOWN', (err) => {
            if (err) console.error(`Failed to update status for monitor ID ${id}`);
          });
        }
        previousStatus = 'DOWN';
      }
    } catch (error) {
      console.log(`HTTP Monitor - URL: ${url}, Error: ${error.message}`);
      
      if (previousStatus === 'UP') {
        sendAlertWithPriority(`HTTP Monitor - URL: ${url} is down`, id, 3);
        updateMonitorStatus(id, 'DOWN', (err) => {
          if (err) console.error(`Failed to update status for monitor ID ${id}`);
        });
      }
      previousStatus = 'DOWN';
    }
  }, schedule * 1000);

  return intervalId;
};
