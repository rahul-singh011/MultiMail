import { pgTable , uuid, varchar, boolean, timestamp } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";


export const apiKeys = pgTable('api_keys', {
    id : uuid('id').primaryKey().defaultRandom(),

    tenantId: uuid('tenant_id')
    .notNull()
    .references(()=> tenants.id , {onDelete : 'cascade'}),

    key: varchar('key', { length: 255 }).notNull().unique(),
    name : varchar('name', { length: 100}).notNull(),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    expiresAt: timestamp('expires_at'),
    
})