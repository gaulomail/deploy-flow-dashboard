'use strict'

const path = require('node:path')
const AutoLoad = require('@fastify/autoload')
const fastifyEnv = require('@fastify/env')
const fastifyCors = require('@fastify/cors')

// Pass --options via CLI arguments in command to enable these options.
const options = {}

module.exports = async function (fastify, opts) {
  // Add CORS configuration
  fastify.register(fastifyCors, {
    origin: ['http://localhost:8080', 'http://localhost:8081'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
  })

  // Register environment variables
  await fastify.register(fastifyEnv, {
    schema: {
      type: 'object',
      required: [],
      properties: {
        SSH_HOST: {
          type: 'string',
          default: ''
        },
        SSH_PORT: {
          type: 'string',
          default: ''
        },
        SSH_USERNAME: {
          type: 'string',
          default: ''
        },
        SSH_KEY_PASSPHRASE: {
          type: 'string',
          default: ''
        },
        GITHUB_TOKEN: {
          type: 'string',
          default: ''
        },
        NODE_ENV: {
          type: 'string',
          default: 'development'
        }
      }
    },
    dotenv: true
  })

  // Place here your custom code!

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: Object.assign({}, opts)
  })

  // This loads all plugins defined in routes
  // define your routes in one of these
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    options: Object.assign({}, opts)
  })

  fastify.register(require("fastify-socket.io"), {
  // put your options here
  });
}

module.exports.options = options
