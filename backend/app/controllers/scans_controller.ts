import type { HttpContext } from '@adonisjs/core/http'
import Scan from '#models/scan'
import { scanValidator } from '#validators/scan'

export default class ScansController {
  async store({ request, auth }: HttpContext) {
    const user = auth.user

    if (!user) {
      throw new Error('User not authenticated')
    }

    const payload = await request.validateUsing(scanValidator)

    const scan = await Scan.updateOrCreate(
      {
        userId: user.id,
        barcodeData: payload.barcodeData,
        format: payload.format,
      },
      {
        userId: user.id,
        barcodeData: payload.barcodeData,
        format: payload.format,
      }
    )

    return {
      status: 'success',
      message: 'Scan saved successfully',
      data: scan,
    }
  }

  async index({ auth }: HttpContext) {
    const user = auth.user

    if (!user) {
      throw new Error('User not authenticated')
    }

    const scans = await Scan.query().where('user_id', user.id).orderBy('created_at', 'desc')

    return {
      status: 'success',
      data: scans,
    }
  }
}
