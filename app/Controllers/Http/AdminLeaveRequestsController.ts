import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import LeaveRequestService from 'App/Services/LeaveRequestService'
import RejectLeaveRequestValidator from 'App/Validators/RejectLeaveRequestValidator'
import LeaveRequest from 'App/Models/LeaveRequest'


export default class AdminLeaveRequestsController {
  public async approve({ params, response, auth }: HttpContextContract) {
    const admin = auth.user!
    
    try {
      const result = await LeaveRequestService.approveRequest(params.id, admin.id)
      return response.status(200).send({
        success: true,
        message: 'Pengajuan cuti berhasil disetujui',
        data: result
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      
      if (message === 'NOT_FOUND') return response.status(404).send({ message: 'Data tidak ditemukan' })
      if (message === 'ALREADY_PROCESSED') return response.status(400).send({ message: 'Pengajuan cuti sudah diproses sebelumnya' })
      if (message === 'INSUFFICIENT_LEAVE_QUOTA') return response.status(400).send({ message: 'Kuota cuti karyawan tidak mencukupi' })
      
      return response.status(500).send({ message: 'Terjadi kesalahan pada server', error: message })
    }
  }

  public async reject({ params, request, response, auth }: HttpContextContract) {
    const admin = auth.user!
    const payload = await request.validate(RejectLeaveRequestValidator)

    try {
      const service = new LeaveRequestService()
      const result = await service.rejectRequest(params.id, admin.id, payload.rejectionReason)
      return response.status(200).send({
        success: true,
        message: 'Pengajuan cuti berhasil ditolak',
        data: result
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      
      if (message === 'NOT_FOUND') return response.status(404).send({ message: 'Data tidak ditemukan' })
      if (message === 'ALREADY_PROCESSED') return response.status(400).send({ message: 'Pengajuan cuti sudah diproses sebelumnya' })
      
      return response.status(500).send({ message: 'Terjadi kesalahan pada server', error: message })
    }
  }

  public async index({ request, response }: HttpContextContract) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)
    
    const statusFilter = request.input('status')

    const query = LeaveRequest.query()
      .preload('employee', (employeeQuery) => {
        employeeQuery.select('id', 'name', 'email')
      })
      .orderBy('createdAt', 'desc')

    if (statusFilter) {
      query.where('status', statusFilter)
    }

    const leaveRequests = await query.paginate(page, limit)

    return response.status(200).send({
      success: true,
      message: 'Berhasil mengambil daftar pengajuan cuti',
      data: leaveRequests
    })
  }
}