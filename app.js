// app.js
const express = require('express');
const monitorRoutes = require('./routes/monitorRoutes');
const { initializeMonitors } = require('./services/monitorService');

const app = express();
app.use(express.json());
app.use('/api', monitorRoutes);

initializeMonitors();

module.exports = app;
