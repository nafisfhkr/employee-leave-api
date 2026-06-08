import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import RegisterValidator from 'App/Validators/RegisterValidator'
import LoginValidator from 'App/Validators/LoginValidator'
import AuthService from 'App/Services/AuthService'
import User from 'App/Models/User'
import { randomUUID } from 'node:crypto'

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

  public async redirectToGoogle({ ally }: HttpContextContract) {
    return ally.use('google').redirect()
  }

  public async handleGoogleCallback({ ally, auth, response }: HttpContextContract) {
    const google = ally.use('google')

    if (google.accessDenied()) {
      return response.status(400).send({ message: 'Akses ditolak oleh pengguna' })
    }
    if (google.stateMisMatch()) {
      return response.status(400).send({ message: 'Sesi kedaluwarsa. Silakan coba lagi' })
    }
    if (google.hasError()) {
      return response.status(400).send({ message: google.getError() })
    }

    const googleUser = await google.user()

    const user = await User.firstOrCreate(
      { email: googleUser.email! },
      {
        id: randomUUID(), 
        name: googleUser.name,
        password: randomUUID(),
        role: 'employee',
        remainingLeave: 12,
        provider: 'google',
        providerId: googleUser.id,
      }
    )

    const token = await auth.use('api').generate(user)

    return response.status(200).send({
      success: true,
      message: 'Login menggunakan Google berhasil',
      data: {
        user,
        access_token: token.token
      }
    })
  }
}