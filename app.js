// app.js
const express = require('express');
const monitorRoutes = require('./routes/monitorRoutes');
// const alertRoutes = require('./routes/alertRoutes');
const logRoutes = require('./routes/logsRoute');
const { initializeMonitors } = require('./services/monitorService');

const app = express();
app.use(express.json());
app.use('/api', monitorRoutes);
// app.use('/api', alertRoutes);
app.use('/api', logRoutes);

initializeMonitors();

module.exports = app;
