// services/alertService.js
let alertCount = 0;
const maxAlerts = 5;
const alertCooldown = 2 * 60 * 1000;
let lastAlertTime = null;
const alertQueue = [];

async function sendAlertWithPriority(serviceName, priority = 1) {
  if (alertCount < maxAlerts) {
    if (priority === 1 || (lastAlertTime === null || Date.now() - lastAlertTime >= alertCooldown)) {
      console.log(`Alert sent for ${serviceName}`);
      lastAlertTime = Date.now();
      alertCount++;
    } else {
      alertQueue.push({ serviceName, priority });
    }
  } else {
    setTimeout(() => {
      alertCount = 0;
      sendQueuedAlerts();
    }, alertCooldown);
  }
}

function sendQueuedAlerts() {
  if (alertQueue.length > 0) {
    const nextAlert = alertQueue.shift();
    sendAlertWithPriority(nextAlert.serviceName, nextAlert.priority);
  }
}

module.exports = { sendAlertWithPriority };
