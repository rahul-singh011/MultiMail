import {db} from '../db/client'
import { contacts } from '../db/schema/contacts'
import { campaigns } from '../db/schema/campaigns'
import { eq, sql } from 'drizzle-orm'

export const trackOpen = async (contactId: string , campaignId : string)=>{
    const [contact] = await db
     .select()
     .from(contacts)
     .where(
        eq(contacts.id , contactId)
     )
     .limit(1)

     if(!contact || contact.status === 'opened') return

     await db
    .update(contacts)
    .set({ status: 'opened' })
    .where(eq(contacts.id, contactId))

    await db
    .update(campaigns)
    .set({
      openCount: sql`${campaigns.openCount} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(campaigns.id, campaignId))
}

export const trackClick = async (contactId: string, campaignId: string)=>{
    const [contact] = await db
    .select()
    .from(contacts)
    .where(eq(contacts.id, contactId))
    .limit(1)

  if (!contact) return

  const alreadyClicked = contact.status === 'clicked'

  await db
    .update(contacts)
    .set({ status: 'clicked' })
    .where(eq(contacts.id, contactId))

    if (!alreadyClicked) {
        await db
          .update(campaigns)
          .set({
            clickCount: sql`${campaigns.clickCount} + 1`,
            updatedAt: new Date(),
          })
          .where(eq(campaigns.id, campaignId))
      }
}