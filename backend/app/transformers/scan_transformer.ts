import { BaseTransformer } from '@adonisjs/core/transformers'
import Scan from '#models/scan'

export default class ScanTransformer extends BaseTransformer<Scan> {
  toObject() {
    return this.pick(this.resource, ['id', 'barcodeData', 'format', 'createdAt'])
  }
}