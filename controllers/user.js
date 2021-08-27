'use strict '

const Boom = require('@hapi/boom')
const users = require('../models/index').users

async function createUser (req, h) {
  let result
  try {
    result = await users.create(req.payload)
  } catch (err) {
    console.error(err)
    return h.view('register', {
      title: 'Registro',
      error: 'Error creando el registro'
    })
  }
  return h.view('register', {
    title: 'Registro',
    success: 'Usuario creado exitosamente'
  })
}

async function validateUser (req, h) {
  let result
  try {
    result = await users.validateUser(req.payload)
    console.log('result ', result)
    if (!result) {
      return h.view('login', {
        title: 'Ingrese',
        error: 'Email y/o password incorectos'
      })
    }
  } catch (err) {
    console.error(err)
    return h.view('login', {
      title: 'Ingrese',
      error: 'Problemas validando el usuario'
    })
  }
  return h.redirect('/').state('user', {
    name: result.name,
    email: result.email
  })
}

function logout (req, h) {
  return h.redirect('/').unstate('user')
}

function failValidation (req, h, err) {
  const templates = {
    '/create-user': 'register',
    '/validate-user': 'login',
    '/create-question': 'ask'
  }
  return h.view(templates[req.path], {
    title: 'Error de validacion',
    error: 'Por favor complete los campos requeridos'
  }).code(400).takeover()
}

module.exports = {
  createUser: createUser,
  failValidation: failValidation,
  validateUser: validateUser,
  logout: logout
}
