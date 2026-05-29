import {db} from '../db/client'
import { contacts } from '../db/schema/contacts'
import { campaigns } from '../db/schema/campaigns'
import { eq, and } from 'drizzle-orm'
import { AppError } from '../utils/errors'

export const addContacts = async (
    tenantId : string,
    campaignId: string,

    data: {
        email : string,
        firstName?: string
        lastName?: string
    }[]
)=>{
    const [campaign] = await db
    .select()
    .from(campaigns)
    .where(
        and(
            eq(campaigns.id , campaignId),
            eq(campaigns.tenantId , tenantId)
        )
    )
    .limit(1)

    if(!campaign) throw new AppError('Campaign Not found', 404)

    if(campaign.status === 'sent' || campaign.status === 'pending'){
        throw new AppError("Cannot add contacts to a campaign that is already sending or sent", 400)
    }

    const inserted = await db
    .insert(contacts)
    .values(
        data.map((contact)=>({
            tenantId,
        campaignId,
        email: contact.email,
        firstName: contact.firstName || null,
        lastName: contact.lastName || null,
        status: 'pending', 
        }))
    )
    .returning()

    await db
    .update(campaigns)
    .set({
      totalRecipients: campaign.totalRecipients! + inserted.length,
      updatedAt: new Date(),
    })
    .where(eq(campaigns.id, campaignId))

    return{
        added: inserted.length,
        totalRecipients: campaign.totalRecipients! + inserted.length,
    }
}

export const getContacts = async(
    tenantId: string, 
    campaignId: string
)=>{
    const [campaign] = await db
    .select()
    .from(campaigns)
    .where(
        and(
            eq(campaigns.id , campaignId),
            eq(campaigns.tenantId , tenantId),
        )
    )
    .limit(1)

    if(!campaign) throw new AppError("Campaign not found", 404)

    const result = await db
    .select()
    .from(contacts)
    .where(
        and(
            eq(contacts.campaignId, campaignId),
            eq(contacts.tenantId , tenantId)
        )
    )

    return result
}