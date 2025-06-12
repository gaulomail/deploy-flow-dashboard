'use strict'

require('dotenv').config();
const fs = require('fs');
const path = require('path');

module.exports = async function (fastify, opts) {
  fastify.post('/', async function (request, reply) {
    // Read private key from file specified in env, default to './id_rsa' if not set
    const privateKeyPath = path.join(process.cwd(), '.ssh/id_rsa');
    let privateKey;
    try {
      privateKey = fs.readFileSync(privateKeyPath, 'utf8');
    } catch (err) {
      reply.code(500);
      return { success: false, error: `Failed to read private key file: ${err.message}` };
    }

    const sshConfig = {
      host: process.env.SSH_HOST,
      port: process.env.SSH_PORT,
      username: process.env.SSH_USERNAME,
      // SSH Key 
      privateKey: privateKey,
      passphrase: process.env.SSH_KEY_PASSPHRASE
    };

    const command = `cd /deploy/mukuru/valtari/valtari/ && cap stg deploy GITHUB_USER=mukuru GITHUB_BRANCH=${request.body.branch} STG_HOST=${request.body.host}`; // Use a non-interactive command that completes

    fastify.ssh.execSSHCommandStream(
                sshConfig,
                command,
                (chunk) => fastify.io.emit(`${request.body.branch}-${request.body.host}-data`, chunk),
                (err) => fastify.io.emit(`${request.body.branch}-${request.body.host}-error`, err.toString()),
                (code, signal) => fastify.io.emit(`${request.body.branch}-${request.body.host}-close`, { code, signal }));
  });
}
