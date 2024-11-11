// services/monitors/tcpMonitor.js
const net = require('net');
const { sendAlertWithPriority, clearAlert } = require('../alertService');
const { addMonitorLog } = require('../../models/monitorModel');

module.exports = (monitor, handleStatusChange) => {
  if (!monitor || !monitor.host || !monitor.port) {
    console.warn('Invalid monitor configuration passed to TCP monitor:', monitor);
    return;
  }

  const { id, host, port, schedule } = monitor;
  let previousStatus = 'UNKNOWN';

  const intervalId = setInterval(() => {
    const client = net.createConnection(port, host);
    client.on('connect', () => {
      const status = 'UP';
      if (status !== previousStatus) {
        handleStatusChange(id, status);
        clearAlert(id);
        previousStatus = status;
      }

      addMonitorLog(id, status, null, (err) => {
        if (err) console.error(`Failed to log TCP monitor check for monitor ID ${id}`);
      });
      client.end();
    });

    client.on('error', (error) => {
      const status = 'DOWN';
      if (status !== previousStatus) {
        handleStatusChange(id, status);
        sendAlertWithPriority(`TCP Monitor - Host: ${host}, Port: ${port} is down`, id, 4);
        previousStatus = status;
      }

      addMonitorLog(id, status, error.message, (err) => {
        if (err) console.error(`Failed to log TCP monitor error for monitor ID ${id}`);
      });
    });
  }, schedule * 1000);

  return intervalId;
};
