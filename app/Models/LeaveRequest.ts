import { DateTime } from 'luxon'
import { column, BaseModel, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import User from 'App/Models/User'

export default class LeaveRequest extends BaseModel {
  @column({ isPrimary: true })
  public declare id: string

  @column()
  public declare userId: string

  @column.date()
  public declare startDate: DateTime

  @column.date()
  public declare endDate: DateTime

  @column()
  public declare totalDays: number

  @column()
  public declare reason: string

  @column()
  public declare attachmentUrl: string

  @column()
  public declare status: string

  @column()
  public declare rejectionReason?: string

  @column()
  public declare approvedBy?: string

  @column.dateTime()
  public declare approvedAt?: DateTime

  @column.dateTime({ autoCreate: true })
  public declare createdAt: DateTime

  @column.dateTime()
  public declare deletedAt?: DateTime

  @belongsTo(() => User, { foreignKey: 'userId' })
  public declare employee: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'approvedBy' })
  public declare approver: BelongsTo<typeof User>
}