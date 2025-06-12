'use strict'

const { Client } = require('ssh2');

module.exports = async function (fastify, opts) {
  fastify.post('/', async function (request, reply) {
    // Replace these with your actual SSH connection details or get them from request.body
    const sshConfig = {
      host: 'your.ssh.server',
      port: 22,
      username: 'your_username',
      // Use one of the following authentication methods:
      // password: 'your_password',
      // OR
      // privateKey: require('fs').readFileSync('/path/to/your/private/key')
    };

    const command = 'eval "$(ssh-agent -s)"'; // Or any command you want to run remotely

    const execSSHCommand = (config, cmd) => {
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
    };

    try {
      const output = await execSSHCommand(sshConfig, command);
      return { success: true, output };
    } catch (err) {
      reply.code(500);
      return { success: false, error: err.toString() };
    }
  });
}
