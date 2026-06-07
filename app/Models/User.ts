import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import { column, beforeSave, BaseModel, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import LeaveRequest from 'App/Models/LeaveRequest'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public declare id: string

  @column()
  public declare name: string

  @column()
  public declare email: string

  @column({ serializeAs: null })
  public password?: string

  @column()
  public declare role: string

  @column()
  public declare remainingLeave: number

  @column()
  public provider?: string

  @column()
  public providerId?: string

  @column.dateTime({ autoCreate: true })
  public declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public declare updatedAt: DateTime

  @column.dateTime()
  public deletedAt?: DateTime

  @hasMany(() => LeaveRequest)
  public declare leaveRequests: HasMany<typeof LeaveRequest>

@beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password && user.password) {
      user.password = await Hash.make(user.password)
    }
  }
}