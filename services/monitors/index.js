module.exports = {
    http: require('./httpMonitor'),
    icmp: require('./icmpMonitor'),
    ssh: require('./sshMonitor'),
    tcp: require('./tcpMonitor'),
    telnet: require('./telnetMonitor'),
    sftp: require('./sftpMonitor'),
  };
  