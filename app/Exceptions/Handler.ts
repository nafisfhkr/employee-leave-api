import Logger from '@ioc:Adonis/Core/Logger'
import HttpExceptionHandler from '@ioc:Adonis/Core/HttpExceptionHandler'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ExceptionHandler extends HttpExceptionHandler {
  constructor() {
    super(Logger)
  }

  public async handle(error: any, ctx: HttpContextContract) {
    const status = error.status || 500
    const message = error.message || 'Internal Server Error'

    if (error.name === 'ValidationException') {
      return ctx.response.status(422).send({
        success: false,
        message: 'Input validation failed',
        errors: error.messages,
      })
    }

    if (error.name === 'AuthenticationException') {
      return ctx.response.status(401).send({
        success: false,
        message: 'Unauthorized access',
      })
    }

    return ctx.response.status(status).send({
      success: false,
      message: message,
    })
  }
}