import { ScanSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.ts'

export default class Scan extends ScanSchema {
    @belongsTo(() => User)
    declare user: BelongsTo<typeof User>
}