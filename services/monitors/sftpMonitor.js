// services/monitors/sftpMonitor.js
const { Client } = require('ssh2');
const { sendAlertWithPriority, clearAlert } = require('../alertService');
const { addMonitorLog } = require('../../models/monitorModel');

module.exports = (monitor, handleStatusChange) => {
  if (!monitor || !monitor.host || !monitor.username || !monitor.password) {
    console.warn('Invalid monitor configuration passed to SFTP monitor:', monitor);
    return;
  }

  const { id, host, username, password, schedule } = monitor;
  let previousStatus = 'UNKNOWN';

  const intervalId = setInterval(() => {
    const ssh = new Client();
    ssh.on('ready', () => {
      ssh.sftp((err, sftp) => {
        const status = err ? 'DOWN' : 'UP';

        if (status !== previousStatus) {
          handleStatusChange(id, status);
          if (status === 'UP') {
            clearAlert(id);
          } else {
            sendAlertWithPriority(`SFTP Monitor - Host: ${host} is down`, id, 6);
          }
          previousStatus = status;
        }

        addMonitorLog(id, status, err ? err.message : null, (logErr) => {
          if (logErr) console.error(`Failed to log SFTP monitor check for monitor ID ${id}`);
        });
        ssh.end();
      });
    });

    ssh.on('error', (error) => {
      const status = 'DOWN';
      if (status !== previousStatus) {
        handleStatusChange(id, status);
        sendAlertWithPriority(`SFTP Monitor - Host: ${host} is down`, id, 6);
        previousStatus = status;
      }

      addMonitorLog(id, status, error.message, (err) => {
        if (err) console.error(`Failed to log SFTP monitor error for monitor ID ${id}`);
      });
    });

    ssh.connect({ host, port: 22, username, password });
  }, schedule * 1000);

  return intervalId;
};
