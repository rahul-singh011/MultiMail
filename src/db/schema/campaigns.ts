import { pgTable, uuid, varchar, timestamp, text, integer } from 'drizzle-orm/pg-core'
import {tenants} from './tenants'

export const campaigns = pgTable('campaigns', {
    id: uuid('id').primaryKey().defaultRandom(),

    tenantId: uuid('tenant_id')
    .notNull()
    .references(()=> tenants.id, {onDelete : 'cascade'}),

    name: varchar('name', {length: 255}).notNull(),
    subject: varchar('subject', { length: 255 }).notNull(),
    body: text('body').notNull(),
    status: varchar('status', { length: 50 }).default('draft'),
    totalRecipients: integer('total_recipients').default(0),

    sentCount:   integer('sent_count').default(0),
    failedCount: integer('failed_count').default(0),
    openCount:   integer('open_count').default(0),
    clickCount:  integer('click_count').default(0),

    scheduledAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
})