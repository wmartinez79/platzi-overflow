server.route({
    method: 'GET',
    path: `/${prefix}/question/{key}`,
    options: {
        validate: {
            params: Joi.object({
                key: Joi.string().required
            }),
            failAction: failValidation
        }
    },
    handler: async (req, h) => {
        let result 
        try {
            result = await questions.getOne(req.params.key)
            if (!result) {
                return Boom.notFound(`No se pudo encontrar la pregunta ${req.params.key}`)
            }
        } catch (error) {
            return Boom.badImplementation(`Hubo un error buscando ${req.params.key} - ${error}`)
        }
        return result
    }
})