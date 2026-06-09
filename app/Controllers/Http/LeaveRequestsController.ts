import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import CreateLeaveRequestValidator from 'App/Validators/CreateLeaveRequestValidator'
import LeaveRequestService from 'App/Services/LeaveRequestService'
import LeaveRequest from 'App/Models/LeaveRequest'

export default class LeaveRequestsController {
  public async store({ request, response, auth }: HttpContextContract) {
    try {
      const payload = await request.validate(CreateLeaveRequestValidator)
      const attachment = request.file('attachment')!
      const user = auth.user!

      const leaveRequest = await LeaveRequestService.createRequest(user, payload, attachment)

      return response.status(201).send({
        success: true,
        message: 'Pengajuan cuti berhasil dibuat',
        data: leaveRequest
      })
    } catch (error) {
      if (error instanceof Error && error.message === 'EXCEEDS_QUOTA') {
        return response.status(400).send({
          success: false,
          message: 'Pengajuan ditolak. Total hari cuti melebihi sisa kuota tahunan Anda.'
        })
      }
      
      return response.status(500).send({ message: 'Terjadi kesalahan pada server' })
    }
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