import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '../../app/models/user.js'

export default class extends BaseSeeder {
  async run() {
    await User.create({
      email: 'test@email.com',
      password: 'Test@123',
      fullName: 'Test User',
    })
  }
}