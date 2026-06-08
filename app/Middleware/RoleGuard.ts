import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class RoleGuard {
  public async handle(
    { auth, response }: HttpContextContract,
    next: () => Promise<void>,
    customGuards: string[] 
  ) {
    const user = auth.user

    if (!user) {
      return response.status(401).send({
        success: false,
        message: 'Unauthorized access',
      })
    }

    if (!customGuards.includes(user.role)) {
      return response.status(403).send({
        success: false,
        message: 'Forbidden: Anda tidak memiliki hak akses ke area ini',
      })
    }

    await next()
  }
}