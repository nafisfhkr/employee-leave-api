import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from 'App/Models/User'
import { randomUUID } from 'crypto'

export default class AdminUserSeeder extends BaseSeeder {
  public async run () {
    await User.updateOrCreate(
      { email: 'admin@company.com' },
      {
        id: randomUUID(),
        name: 'Super Administrator',
        password: 'password123',
        role: 'admin',
        remainingLeave: 12,
      }
    )
    
    console.log('Akun Admin berhasil disuntikkan ke database!')
  }
}