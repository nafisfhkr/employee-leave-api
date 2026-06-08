import { schema, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class RejectLeaveRequestValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    rejectionReason: schema.string({ trim: true }),
  })

  public messages: CustomMessages = {
    'rejectionReason.required': 'Alasan penolakan wajib diisi',
  }
}