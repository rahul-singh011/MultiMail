import { pgTable , uuid , varchar , timestamp , boolean } from "drizzle-orm/pg-core";

export const tenants = pgTable('tenants', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name' , {length : 100}).notNull(),
    email : varchar('email', {length: 255}).notNull().unique(),
    password : varchar('password', {length: 255}).notNull(),
    plan : varchar('plan' , {length: 50}).default('free'),
    isActive: boolean('is_active').default(true),

    createdAt : timestamp('created_at').defaultNow(),
    updatedAt : timestamp('updated_at').defaultNow(),
    
})