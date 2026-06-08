import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import CreateLeaveRequestValidator from 'App/Validators/CreateLeaveRequestValidator'
import LeaveRequestService from 'App/Services/LeaveRequestService'

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
}