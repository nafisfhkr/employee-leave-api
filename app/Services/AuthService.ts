import User from 'App/Models/User'
import { randomUUID } from 'crypto'

export default class AuthService {
  public static async registerEmployee(payload: any) {
    const user = await User.create({
      id: randomUUID(),
      name: payload.name,
      email: payload.email,
      password: payload.password,
      role: 'employee',
      remainingLeave: 12
    })
    
    return user
  }
}