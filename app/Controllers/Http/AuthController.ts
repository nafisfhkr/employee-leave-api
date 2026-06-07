import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import RegisterValidator from 'App/Validators/RegisterValidator'
import LoginValidator from 'App/Validators/LoginValidator'
import AuthService from 'App/Services/AuthService'

export default class AuthController {
  public async register({ request, response, auth }: HttpContextContract) {
    const payload = await request.validate(RegisterValidator)

    const user = await AuthService.registerEmployee(payload)

    const token = await auth.use('api').generate(user)

    return response.status(201).send({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        access_token: token.token
      }
    })
  }

  public async login({ request, response, auth }: HttpContextContract) {
    const payload = await request.validate(LoginValidator)

    try {
      const token = await auth.use('api').attempt(payload.email, payload.password)
      
      return response.status(200).send({
        success: true,
        message: 'Login successful',
        data: {
          access_token: token.token
        }
      })
    } catch (error) {
      return response.status(401).send({
        success: false,
        message: 'Email atau password salah'
      })
    }
  }

  public async refresh({ auth, response }: HttpContextContract) {
    try {
      const user = auth.user

      if (!user) {
        return response.status(401).send({
          success: false,
          message: 'Unauthorized access',
        })
      }

      await auth.use('api').revoke()

      const token = await auth.use('api').generate(user)

      return response.status(200).send({
        success: true,
        message: 'Token rotated successfully',
        data: {
          access_token: token.token
        }
      })
    } catch (error) {
      return response.status(401).send({
        success: false,
        message: 'Invalid or expired token'
      })
    }
  }
}