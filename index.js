'use strict'

const hapi = require('@hapi/hapi')
const handlebars = require('./lib/helpers')
const inert = require('@hapi/inert')
const methods = require('./lib/methods')
const path = require('path')
const routes = require('./routes')
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

        server.method('setAnswerRight', methods.setAnswerRight)
        server.method('getLast', methods.getLast, {
            cache: {
                expiresIn: 1000 * 60,
                generateTimeout: 2000
            }
        })

        server.state('user', {
            ttl: 1000 * 60 * 60 * 24 *7,
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
    console.log(`Servidor ejecutandose en ${server.info.uri}`)
}

process.on('unhandleRejection', error => {
    console.error('UnhandleRejection', error.message, error)
})

process.on('unhandleException', error => {
    console.error('UnhandleException', error.message, error)
})

init()

