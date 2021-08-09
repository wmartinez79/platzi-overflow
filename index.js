'use strict'

const hapi = require('@hapi/hapi')
const handlebars = require('handlebars')
const inert = require('@hapi/inert')
const path = require('path')
const vision = require('@hapi/vision')

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
        await server.register(inert);
        await server.register(vision);

        server.views({
            engines: {
                hbs: handlebars
            },
            relativeTo: __dirname,
            path: 'views',
            layout: true,
            layoutPath: 'views'
        })
        server.route({
            method: 'GET',
            path: '/',
            handler: (req, h) => {
                return h.view('index', {
                    title: 'home'
                })
            }
        })

        server.route({
            method: 'GET',
            path: '/{param*}',
            handler: {
                directory: {
                    path: '.',
                    index: ['index.html']
                }
            }
        })

         await server.start();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
    console.log(`Servidor lanzado en ${server.info.uri}`);
}

init()

