'use strict'

const { writeFile } = require('fs')
const { promisify } = require('util')
const { join } = require('path')
const { v1: uuid } = require('uuid')
const questions = require('../models/index').questions

const write = promisify(writeFile)

async function createQuestion (req, h) {
  if (!req.state.user) {
    return h.redirect('/login')
  }
  let result, filename
  try {
    const question = { ...req.payload }
    const x = Buffer.from(question.image)
    if (Buffer.isBuffer(x)) {
      filename = `${uuid()}.png`
      await write(join(__dirname, '..', 'public', 'uploads', filename), question.image)
    }
    result = await questions.create(question, req.state.user, filename)
    req.log('info', `Pregunta creada con el id ${result}`)
  } catch (error) {
    req.log('error', `Ocurrio un error: ${error}`)

    return h.view('ask', {
      title: 'Crear pregunta',
      error: 'Problemas creando la pregunta'
    }).code(500).takeover()
  }

  return h.redirect(`/question/${result}`)
}

async function answerQuestion (req, h) {
  if (!req.state.user) {
    return h.redirect('/login')
  }
  let result
  try {
    result = await questions.answer(req.payload, req.state.user)
    console.log(`Respuesta creada: ${result}`)
  } catch (error) {
    console.log(error)
  }
  return h.redirect(`/question/${req.payload.id}`)
}

async function setAnswerRight (req, h) {
  if (!req.state.user) {
    return h.redirect('/login')
  }
  let result
  try {
    result = await req.server.methods.setAnswerRight(req.params.questionId, req.params.answerId, req.state.user)
    console.log(result)
  } catch (error) {
    console.error(error)
  }

  return h.redirect(`/question/${req.params.questionId}`)
}

module.exports = {
  answerQuestion: answerQuestion,
  createQuestion: createQuestion,
  setAnswerRight: setAnswerRight
}
