// services/monitors/telnetMonitor.js
const { Telnet } = require('telnet-client');
const { sendAlertWithPriority, clearAlert } = require('../alertService');
const { addMonitorLog } = require('../../models/monitorModel');

module.exports = (monitor, handleStatusChange) => {
  if (!monitor || !monitor.host || !monitor.port) {
    console.warn('Invalid monitor configuration passed to Telnet monitor:', monitor);
    return;
  }

  const { id, host, port, schedule } = monitor;
  let previousStatus = 'UNKNOWN';

  const intervalId = setInterval(async () => {
    const connection = new Telnet();
    try {
      await connection.connect({ host, port });
      const status = 'UP';

      if (status !== previousStatus) {
        handleStatusChange(id, status);
        clearAlert(id);
        previousStatus = status;
      }

      addMonitorLog(id, status, null, (err) => {
        if (err) console.error(`Failed to log Telnet monitor check for monitor ID ${id}`);
      });
      connection.end();
    } catch (error) {
      const status = 'DOWN';

      if (status !== previousStatus) {
        handleStatusChange(id, status);
        sendAlertWithPriority(`Telnet Monitor - Host: ${host}, Port: ${port} is down`, id, 7);
        previousStatus = status;
      }

      addMonitorLog(id, status, error.message, (err) => {
        if (err) console.error(`Failed to log Telnet monitor error for monitor ID ${id}`);
      });
    }
  }, schedule * 1000);

  return intervalId;
};
