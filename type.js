// ICMP (Ping) Monitor
const icmpMonitor = (host, schedule, timeout, wait) => {
    setInterval(() => {
      ping.sys.probe(host, (isAlive) => {
        const status = isAlive ? "UP" : "DOWN";
        console.log(`ICMP Monitor - Host: ${host}, Status: ${status}`);
  
        if (!isAlive) {
          // Service is down, trigger an alert with priority 1
          sendAlertWithPriority(`ICMP Monitor - Host: ${host} is down`, 1);
        } else {
          // Service is up, clear any alerts related to this service
          // Replace with a function to clear alerts
        }
      });
    }, schedule * 1000); // Convert seconds to milliseconds for setInterval
  
    setTimeout(() => {
      clearInterval();
    }, timeout * 1000);
  };
  

  
  // TCP Monitor
  const tcpMonitor = (host, port, schedule, timeout) => {
    setInterval(() => {
      const client = net.createConnection(port, host);
      client.on("connect", () => {
        console.log(`TCP Monitor - Host: ${host}, Port: ${port}, Status: UP`);
  
        // Service is up, clear any alerts related to this service
        // Replace with a function to clear alerts
      });
      client.on("error", (error) => {
        console.log(`TCP Monitor - Host: ${host}, Port: ${port}, Status: DOWN, Error: ${error.message}`);
  
        // Service is down, trigger an alert with priority 4
        sendAlertWithPriority(`TCP Monitor - Host: ${host}, Port: ${port} is down`, 4);
      });
    }, schedule * 1000); // Convert seconds to milliseconds for setInterval
  
    setTimeout(() => {
      clearInterval();
    }, timeout * 1000);
  };
  
  // SSH Monitor (You'll need to provide SSH credentials)
  const sshMonitor = (host, username, password, schedule, timeout,port = 22) => {
    setInterval(() => {
      const ssh = new Client();
      ssh.on("ready", () => {
        console.log(`SSH Monitor - Host: ${host}, Status: UP`);
  
        // Service is up, clear any alerts related to this service
        // Replace with a function to clear alerts
      });
      ssh.on("error", (error) => {
        console.log(`SSH Monitor - Host: ${host}, Status: DOWN, Error: ${error.message}`);
  
        // Service is down, trigger an alert with priority 5
        sendAlertWithPriority(`SSH Monitor - Host: ${host} is down`, 5);
      });
      ssh.connect({
        host,
        port,
        username,
        password,
      });
    }, schedule * 1000); // Convert seconds to milliseconds for setInterval
  
    setTimeout(() => {
      clearInterval();
    }, timeout * 1000);
  };
  
  // SFTP Monitor (You'll need to provide SFTP credentials)
  const sftpMonitor = (host, username, password, schedule, timeout) => {
    setInterval(() => {
      const ssh = new Client();
      ssh.on("ready", () => {
        ssh.sftp((err, sftp) => {
          if (err) {
            console.log(`SFTP Monitor - Host: ${host}, Status: DOWN, Error: ${err.message}`);
  
            // Service is down, trigger an alert with priority 6
            sendAlertWithPriority(`SFTP Monitor - Host: ${host} is down`, 6);
            ssh.end();
          } else {
            console.log(`SFTP Monitor - Host: ${host}, Status: UP`);
  
            // Service is up, clear any alerts related to this service
            // Replace with a function to clear alerts
            ssh.end();
          }
        });
      });
      ssh.on("error", (error) => {
        console.log(`SFTP Monitor - Host: ${host}, Status: DOWN, Error: ${error.message}`);
  
        // Service is down, trigger an alert with priority 6
        sendAlertWithPriority(`SFTP Monitor - Host: ${host} is down`, 6);
      });
      ssh.connect({
        host,
        port: 22,
        username,
        password,
      });
    }, schedule * 1000); // Convert seconds to milliseconds for setInterval
  
    setTimeout(() => {
      clearInterval();
    }, timeout * 1000);
  };
  
  // Telnet Monitor
  const telnetMonitor = async (host, port, schedule, timeout) => {
    setInterval(async () => {
      const connection = new Telnet();
      try {
        await connection.connect({
          host,
          port,
        });
        console.log(`Telnet Monitor - Host: ${host}, Port: ${port}, Status: UP`);
  
        // Service is up, clear any alerts related to this service
        // Replace with a function to clear alerts
        connection.end();
      } catch (error) {
        console.log(`Telnet Monitor - Host: ${host}, Port: ${port}, Status: DOWN, Error: ${error.message}`);
  
        // Service is down, trigger an alert with priority 7
        sendAlertWithPriority(`Telnet Monitor - Host: ${host}, Port: ${port} is down`, 7);
      }
    }, schedule * 1000); // Convert seconds to milliseconds for setInterval
  
    setTimeout(() => {
      clearInterval();
    }, timeout * 1000);
  };