import LeaveRequest from 'App/Models/LeaveRequest'
import Application from '@ioc:Adonis/Core/Application'
import { randomUUID } from 'crypto'

export default class LeaveRequestService {
  public static async createRequest(user: any, payload: any, attachment: any) {
    const diffInMilliseconds = payload.endDate.toMillis() - payload.startDate.toMillis()
    const totalDays = Math.ceil(diffInMilliseconds / (1000 * 60 * 60 * 24)) + 1 

    const fileName = `${randomUUID()}.${attachment.extname}`
    await attachment.move(Application.tmpPath('uploads'), {
      name: fileName,
      overwrite: true,
    })

    const leaveRequest = await LeaveRequest.create({
      id: randomUUID(),
      userId: user.id,
      startDate: payload.startDate,
      endDate: payload.endDate,
      totalDays: totalDays,
      reason: payload.reason,
      attachmentUrl: `uploads/${fileName}`,
      status: 'pending'
    })

    return leaveRequest
  }
}