'use strict'

const hapi = require('@hapi/hapi')
const blankie = require('blankie')
const crumb = require('@hapi/crumb')
const hapiDevErrors = require('hapi-dev-errors')
const handlebars = require('./lib/helpers')
const inert = require('@hapi/inert')
const good = require('@hapi/good')
const methods = require('./lib/methods')
const path = require('path')
const routes = require('./routes')
const scooter = require('@hapi/scooter')
const vision = require('@hapi/vision')
const site = require('./controllers/site')

const server = hapi.server({
  port: process.env.PORT || 3000,
  host: 'localhost',
  routes: {
    files: {
      relativeTo: path.join(__dirname, 'public')
    }
  }
})

async function init () {
  try {
    await server.register(inert)
    await server.register(vision)
    await server.register({
      plugin: good,
      options: {
        reporters: {
          console: [
            {
              module: require('@hapi/good-console')
            },
            'stdout'
          ]
        }
      }
    })

    await server.register({
      plugin: crumb,
      options: {
        cookieOptions: {
          isSecure: process.env.NODE_ENV === 'prod'
        }
      }
    })

    await server.register([scooter, {
      plugin: blankie,
      options: {
        defaultSrc: `'self' 'unsafe-inline'`,
        styleSrc: `'self' 'unsafe-inline' https://maxcdn.bootstrapcdn.com`,
        fontSrc: `'self' 'unsafe-inline' data:`,
        scriptSrc: `'self' 'unsafe-inline' https://maxcdn.bootstrapcdn.com https://code.jquery.com https://cdnjs.cloudflare.com`,
        generateNonces: false
      }
    }])

    await server.register(({
      plugin: hapiDevErrors,
      options: {
        showErrors: process.env.NODE_ENV !== 'prod'
      }
    }))

    await server.register({
      plugin: require('./lib/api'),
      options: {
        prefix: 'api'
      }
    })

    server.method('setAnswerRight', methods.setAnswerRight)
    server.method('getLast', methods.getLast, {
      cache: {
        expiresIn: 1000 * 60,
        generateTimeout: 2000
      }
    })

    server.state('user', {
      ttl: 1000 * 60 * 60 * 24 * 7,
      isSecure: process.env.NODE_ENV === 'prod',
      encoding: 'base64json'
    })

    server.views({
      engines: {
        hbs: handlebars
      },
      relativeTo: __dirname,
      path: 'views',
      layout: true,
      layoutPath: 'views'
    })

    server.ext('onPreResponse', site.fileNotFound)

    server.route(routes)

    await server.start()
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
  server.log('info', `Servidor ejecutandose en ${server.info.uri}`)
}

process.on('unhandledRejection', error => {
  server.error('UnhandledRejection', error)
})

process.on('unhandledException', error => {
  server.error('UnhandledException', error)
})

init().then(r => console.log('init method'))
