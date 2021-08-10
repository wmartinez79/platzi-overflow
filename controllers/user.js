'use strict '

const users = require('../models/index').users

async function createUser(req, h) {
    let result
    try {
        result = await users.create(req.payload)
    } catch(err) {
        console.error(err)
        return h.response('Problemas creando el usuario')
    }
    return h.response(`Usuario creado ID: ${result}`)
}

module.exports = {
    createUser: createUser
}