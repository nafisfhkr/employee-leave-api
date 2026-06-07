import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'leave_requests'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE')
      table.date('start_date').notNullable()
      table.date('end_date').notNullable()
      table.integer('total_days').notNullable()
      table.text('reason').notNullable()
      table.string('attachment_url', 500).notNullable()
      table.enum('status', ['pending', 'approved', 'rejected']).defaultTo('pending')
      table.text('rejection_reason').nullable()
      table.uuid('approved_by').references('id').inTable('users').nullable() 
      
      table.timestamp('approved_at', { useTz: true }).nullable() 
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('deleted_at', { useTz: true }).nullable() 
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}

