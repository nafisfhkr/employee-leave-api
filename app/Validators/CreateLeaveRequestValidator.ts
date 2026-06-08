import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateLeaveRequestValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    startDate: schema.date({ format: 'yyyy-MM-dd' }),
    endDate: schema.date({ format: 'yyyy-MM-dd' }, [
      rules.afterOrEqualToField('startDate')
    ]),
    reason: schema.string({ trim: true }),
    attachment: schema.file({
      size: '5mb',
      extnames: ['pdf', 'jpg', 'jpeg', 'png'],
    }),
  })

  public messages: CustomMessages = {
    'startDate.required': 'Tanggal mulai cuti wajib diisi',
    'endDate.required': 'Tanggal selesai cuti wajib diisi',
    'endDate.afterOrEqualToField': 'Tanggal selesai tidak boleh mendahului tanggal mulai',
    'reason.required': 'Alasan cuti wajib diisi',
    'attachment.required': 'Dokumen lampiran wajib diunggah',
    'attachment.size': 'Ukuran file lampiran maksimal adalah 5MB',
    'attachment.extname': 'Format file lampiran harus PDF, JPG, atau PNG',
  }
}