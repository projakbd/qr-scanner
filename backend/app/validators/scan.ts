import vine from '@vinejs/vine'

export const scanValidator = vine.create({
  barcodeData: vine.string(),
  format: vine.string(),
})
