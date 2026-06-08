import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class RegisterValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    name: schema.string({}, [
      rules.trim()
    ]),
    email: schema.string({}, [
      rules.email(),
      rules.normalizeEmail({ allLowercase: true }),
      rules.unique({ table: 'users', column: 'email' })
    ]),
    password: schema.string({}, [
      rules.minLength(8)
    ])
  })

  public messages: CustomMessages = {
    'name.required': 'Nama lengkap wajib diisi',
    'email.required': 'Email wajib diisi',
    'email.email': 'Format email tidak valid',
    'email.unique': 'Email ini sudah terdaftar',
    'password.required': 'Password wajib diisi',
    'password.minLength': 'Password minimal harus 8 karakter'
  }
}