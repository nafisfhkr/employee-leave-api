import LeaveRequest from 'App/Models/LeaveRequest'
import Application from '@ioc:Adonis/Core/Application'
import { randomUUID } from 'crypto'
import Database from '@ioc:Adonis/Lucid/Database'
import { DateTime } from 'luxon'
import User from 'App/Models/User'

export default class LeaveRequestService {
  public static async createRequest(user: any, payload: any, attachment: any) {
    const diffInMilliseconds = payload.endDate.toMillis() - payload.startDate.toMillis()
    const totalDays = Math.ceil(diffInMilliseconds / (1000 * 60 * 60 * 24)) + 1 


    if (totalDays > user.remainingLeave) {
      throw new Error('EXCEEDS_QUOTA') 
    }

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

  public static async approveRequest(id: string, adminId: string) {
    const trx = await Database.transaction()

    try {
      const request = await LeaveRequest.query({ client: trx }).where('id', id).first()
      if (!request) throw new Error('NOT_FOUND')
      if (request.status !== 'pending') throw new Error('ALREADY_PROCESSED')

      const employee = await User.query({ client: trx })
        .where('id', request.userId)
        .forUpdate()
        .first()

      if (!employee) throw new Error('EMPLOYEE_NOT_FOUND')

      if (employee.remainingLeave < request.totalDays) {
        throw new Error('INSUFFICIENT_LEAVE_QUOTA')
      }

      employee.remainingLeave -= request.totalDays
      await employee.useTransaction(trx).save()

      request.status = 'approved'
      request.approvedBy = adminId
      request.approvedAt = DateTime.now()
      await request.useTransaction(trx).save()

      await trx.commit()
      return request
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  public async rejectRequest(id: string, adminId: string, reason: string) {
    const trx = await Database.transaction()

    try {
      const request = await LeaveRequest.query({ client: trx }).where('id', id).first()
      if (!request) throw new Error('NOT_FOUND')
      if (request.status !== 'pending') throw new Error('ALREADY_PROCESSED')

      request.status = 'rejected'
      request.rejectionReason = reason
      request.approvedBy = adminId
      request.approvedAt = DateTime.now()
      
      await request.useTransaction(trx).save()
      await trx.commit()
      return request
    } catch (error) {
      await trx.rollback()
      throw error
    }
}
}