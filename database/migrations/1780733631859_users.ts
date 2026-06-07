import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.string('name', 255).notNullable()
      table.string('email', 255).notNullable().unique()
      table.string('password', 255).nullable()
      table.enum('role', ['employee', 'admin']).defaultTo('employee')
      table.integer('remaining_leave').defaultTo(12)
      table.string('provider', 50).nullable()
      table.string('provider_id', 255).nullable()
      
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
      table.timestamp('deleted_at', { useTz: true }).nullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}