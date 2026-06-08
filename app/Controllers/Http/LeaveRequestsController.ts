import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import CreateLeaveRequestValidator from 'App/Validators/CreateLeaveRequestValidator'
import LeaveRequestService from 'App/Services/LeaveRequestService'
import LeaveRequest from 'App/Models/LeaveRequest'

export default class LeaveRequestsController {
  public async store({ request, response, auth }: HttpContextContract) {
    const payload = await request.validate(CreateLeaveRequestValidator)
    
    const attachment = request.file('attachment')!

    const user = auth.user!

    const leaveRequest = await LeaveRequestService.createRequest(user, payload, attachment)

    return response.status(201).send({
      success: true,
      message: 'Pengajuan cuti berhasil dibuat',
      data: leaveRequest
    })
  }

  public async index({ request, auth, response }: HttpContextContract) {
    const user = auth.user!
    
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)

    const leaveRequests = await LeaveRequest.query()
      .where('userId', user.id)
      .orderBy('createdAt', 'desc')
      .paginate(page, limit)

    return response.status(200).send({
      success: true,
      message: 'Berhasil mengambil riwayat cuti',
      data: leaveRequests
    })
  }
}