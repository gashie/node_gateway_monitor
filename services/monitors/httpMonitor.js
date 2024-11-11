// services/monitors/httpMonitor.js
const axios = require('axios');
const { sendAlertWithPriority } = require('../alertService');

module.exports = (url, schedule, timeout) => {
  setInterval(async () => {
    try {
      const response = await axios.get(url);
      console.log(`HTTP Monitor - URL: ${url}, Status Code: ${response.status}`);
      if (response.status !== 200) {
        sendAlertWithPriority(`HTTP Monitor - URL: ${url} is down`, 2);
      }
    } catch (error) {
      sendAlertWithPriority(`HTTP Monitor - URL: ${url} is down`, 3);
    }
  }, schedule * 1000);
};
