import { pgTable, uuid, varchar, timestamp, boolean } from 'drizzle-orm/pg-core'
import { tenants } from './tenants'
import { campaigns } from './campaigns'


export const contacts = pgTable('contacts',{
    id: uuid('id').primaryKey().defaultRandom(),

    tenantId: uuid('tenant_id')
    .notNull()
    .references(()=> tenants.id, {onDelete: 'cascade'}),

    campaignId: uuid('campaign_id')
    .notNull()
    .references(()=> campaigns.id , {onDelete: 'cascade'}),

    email: varchar('email', { length: 255 }).notNull(),
    firstName: varchar('first_name', {length: 100}),
    lastName: varchar('last_name', {length: 100}),

    status: varchar('status', {length: 50}).default('pending'),
    unsubscribed: boolean('unsubscribed').default(false),
    createAt : timestamp('crearted_at').defaultNow(),

})