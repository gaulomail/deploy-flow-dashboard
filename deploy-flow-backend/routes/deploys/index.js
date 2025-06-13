'use strict'

require('dotenv').config();
const fs = require('fs');
const path = require('path');

/**
 * Converts a host string to its numeric counterpart.
 * E.g., 'staging-1' => '001', 'staging-12' => '012', 'ubt' => 'ubt'
 * @param {string} host
 * @returns {string}
 */
function hostToNumeric(host) {
  const stagingMatch = /^staging-(\d+)$/.exec(host);
  if (stagingMatch) {
    // Pad the number to 3 digits
    return stagingMatch[1].padStart(3, '0');
  }
  // If it's 'ubt' or any other, return as is (or customize as needed)
  return host;
}

module.exports = async function (fastify, opts) {
  fastify.post('/', async function (request, reply) {
    
    // Input validation
    const { branch, host } = request.body || {};
    if (
      typeof branch !== 'string' || branch.trim() === '' ||
      typeof host !== 'string' || host.trim() === ''
    ) {
      reply.code(400);
      return { success: false, error: 'Invalid input: "branch" and "host" are required string fields.' };
    }

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
      passphrase: process.env.SSH_KEY_PASSPHRASE ?? undefined
    };

    // Convert host to numeric code
    const hostCode = hostToNumeric(host);
    const command = `cd /deploy/mukuru/valtari/valtari/ && cap stg deploy GITHUB_USER=mukuru GITHUB_BRANCH=${branch} STG_HOST=${hostCode}`; // Use a non-interactive command that completes
    const refreshCommand = `cd /deploy/mukuru/valtari/valtari/ && cap stg deploy_lock:release GITHUB_USER=mukuru STG_HOST=${hostCode}`;

    const result = await fastify.ssh.execSSHCommand(sshConfig, refreshCommand);
    
    console.log('deploy_lock:release',result)

    fastify.ssh.execSSHCommandStream(
                sshConfig,
                command,
                (chunk) => fastify.io.emit(`${branch}-${host}-data`, chunk),
                (err) => fastify.io.emit(`${branch}-${host}-error`, err.toString()),
                (code, signal) => fastify.io.emit(`${branch}-${host}-close`, { code, signal }));
  });
}
