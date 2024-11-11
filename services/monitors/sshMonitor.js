// services/monitors/sshMonitor.js
const { Client } = require('ssh2');
const { sendAlertWithPriority, clearAlert } = require('../alertService');
const { addMonitorLog } = require('../../models/monitorModel');

module.exports = (monitor, handleStatusChange) => {
  if (!monitor || !monitor.host || !monitor.username || !monitor.password) {
    console.warn('Invalid monitor configuration passed to SSH monitor:', monitor);
    return;
  }

  const { id, host, username, password, port = 22, schedule } = monitor;
  let previousStatus = 'UNKNOWN';

  const intervalId = setInterval(() => {
    const ssh = new Client();
    ssh.on('ready', () => {
      const status = 'UP';
      if (status !== previousStatus) {
        handleStatusChange(id, status);
        clearAlert(id);
        previousStatus = status;
      }

      addMonitorLog(id, status, null, (err) => {
        if (err) console.error(`Failed to log SSH monitor check for monitor ID ${id}`);
      });
      ssh.end();
    });

    ssh.on('error', (error) => {
      const status = 'DOWN';
      if (status !== previousStatus) {
        handleStatusChange(id, status);
        sendAlertWithPriority(`SSH Monitor - Host: ${host} is down`, id, 5);
        previousStatus = status;
      }

      addMonitorLog(id, status, error.message, (err) => {
        if (err) console.error(`Failed to log SSH monitor error for monitor ID ${id}`);
      });
    });

    ssh.connect({ host, port, username, password });
  }, schedule * 1000);

  return intervalId;
};
