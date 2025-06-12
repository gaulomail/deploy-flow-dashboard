// plugins/githubClient.js
// Fastify plugin to provide a GitHub HTTP client for fetching branch info
const fp = require('fastify-plugin');
const { Client } = require('ssh2');

async function sshClient(fastify, options) {
  // Fetch branches for a given repo (public or with token)
  fastify.decorate('ssh', {
    execSSHCommand(config, cmd) {
      return new Promise((resolve, reject) => {
        const conn = new Client();
        conn.on('ready', () => {
          conn.exec(cmd, (err, stream) => {
            if (err) {
              conn.end();
              return reject(err);
            }
            let stdout = '';
            let stderr = '';
            stream.on('close', (code, signal) => {
              conn.end();
              if (code === 0) {
                resolve(stdout);
              } else {
                reject(stderr || `Command exited with code ${code}`);
              }
            }).on('data', (data) => {
              stdout += data;
            }).stderr.on('data', (data) => {
              stderr += data;
            });
          });
        }).on('error', (err) => {
          reject(err);
        }).connect(config);
      });
    },
    // Streaming version for socket.io
    execSSHCommandStream(config, cmd, onData, onError, onClose) {
      const conn = new Client();
      conn.on('ready', () => {
        conn.exec(cmd, (err, stream) => {
          if (err) {
            conn.end();
            if (onError) onError(err);
            return;
          }
          stream.on('close', (code, signal) => {
            conn.end();
            if (onClose) onClose(code, signal);
          }).on('data', (data) => {
            if (onData) onData(data.toString());
          }).stderr.on('data', (data) => {
            if (onError) onError(data.toString());
          });
        });
      }).on('error', (err) => {
        if (onError) onError(err);
      }).connect(config);
    }
  });
}

module.exports = fp(sshClient);
