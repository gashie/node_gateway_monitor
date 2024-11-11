// services/monitors/icmpMonitor.js
const ping = require('ping');
const { sendAlertWithPriority, clearAlert } = require('../alertService');
const { addMonitorLog } = require('../../models/monitorModel');

module.exports = (monitor, handleStatusChange) => {
  if (!monitor || !monitor.host) {
    console.warn('Invalid monitor configuration passed to ICMP monitor:', monitor);
    return;
  }

  const { id, host, schedule } = monitor;
  let previousStatus = 'UNKNOWN';

  const intervalId = setInterval(() => {
    ping.sys.probe(host, (isAlive) => {
      const status = isAlive ? 'UP' : 'DOWN';

      if (status !== previousStatus) {
        handleStatusChange(id, status);
        if (status === 'UP') {
          clearAlert(id);
        } else {
          sendAlertWithPriority(`ICMP Monitor - Host: ${host} is down`, id, 1);
        }
        previousStatus = status;
      }

      addMonitorLog(id, status, null, (err) => {
        if (err) console.error(`Failed to log ICMP monitor check for monitor ID ${id}`);
      });
    });
  }, schedule * 1000);

  return intervalId;
};
