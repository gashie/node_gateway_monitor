// controllers/checkMonitorController.js
const axios = require('axios');
const ping = require('ping');
const net = require('net');
const Client = require('ssh2').Client;
const { Telnet } = require('telnet-client');

const checkMonitor = async (req, res) => {
  const { type, config } = req.body;

  try {
    let status;
    switch (type) {
      case 'http':
        status = await checkHTTP(config.url);
        break;
      case 'icmp':
        status = await checkICMP(config.host);
        break;
      case 'tcp':
        status = await checkTCP(config.host, config.port);
        break;
      case 'ssh':
        status = await checkSSH(config.host, config.username, config.password, config.port);
        break;
      case 'telnet':
        status = await checkTelnet(config.host, config.port);
        break;
      default:
        return res.status(400).json({ error: 'Unknown monitor type' });
    }
    res.json({ status });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check monitor status', details: error.message });
  }
};

// Helper functions for each monitor type
async function checkHTTP(url) {
  try {
    const response = await axios.get(url);
    return response.status === 200 ? 'UP' : 'DOWN';
  } catch {
    return 'DOWN';
  }
}

async function checkICMP(host) {
  return new Promise((resolve) => {
    ping.sys.probe(host, (isAlive) => {
      resolve(isAlive ? 'UP' : 'DOWN');
    });
  });
}

async function checkTCP(host, port) {
  return new Promise((resolve) => {
    const client = net.createConnection(port, host);
    client.on('connect', () => {
      client.end();
      resolve('UP');
    });
    client.on('error', () => {
      resolve('DOWN');
    });
  });
}

async function checkSSH(host, username, password, port = 22) {
  return new Promise((resolve) => {
    const ssh = new Client();
    ssh
      .on('ready', () => {
        ssh.end();
        resolve('UP');
      })
      .on('error', () => {
        resolve('DOWN');
      })
      .connect({ host, port, username, password });
  });
}

async function checkTelnet(host, port) {
  const connection = new Telnet();
  try {
    await connection.connect({ host, port });
    connection.end();
    return 'UP';
  } catch {
    return 'DOWN';
  }
}

module.exports = { checkMonitor };
