import { db } from '../db/client'
import { campaigns } from '../db/schema/campaigns'
import { eq, and } from 'drizzle-orm'
import { AppError } from '../utils/errors'
import emailQueue from '../queues/emailQueue'
import { contacts } from '../db/schema/contacts'

// Create
export const createCampaign = async(
    tenantId: string,
    data: {
        name: string
        subject: string
        body: string
        scheduledAt?: Date
    }
)=> {

    const [campaign] = await db
    .insert(campaigns)
    .values({
        tenantId,
        name: data.name,
        subject: data.subject,
        body: data.body,
        scheduledAt: data.scheduledAt || null,
        status : 'draft',
    })
    .returning()

    return campaign
}

// List All
export const getCampaigns = async (tenantId : string)=>{
    const result = await db
     .select()
     .from(campaigns)
     .where(eq(campaigns.tenantId, tenantId))

     return result
}

// Get one
export const getCampaignById = async (tenantId: string  , campaignId: string)=> {
    const [campaign] = await db
    .select()
    .from(campaigns)
    .where(
        and(
            eq(campaigns.tenantId, tenantId),
            eq(campaigns.id, campaignId)
        )
    )
    .limit(1)

    if (!campaign) throw new AppError('Campaign not found', 404)
    
    return campaign
}

// Update
export const updateCampaign = async (
    tenantId : string,
    campaignId: string,
    data: {
        name?: string
        subject?: string
        body?: string
        scheduledAt?: Date
    }
)=>{
    await getCampaignById(tenantId, campaignId)
    const [existing] = await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.id, campaignId))
    .limit(1)

    if (existing.status === 'sent' || existing.status === 'sending') {
        throw new AppError('Cannot edit a campaign that is already sending or sent', 400)
      }

      const [updated] = await db
      .update(campaigns)
      .set({
        ...data,                          
        updatedAt: new Date(),           
      })
      .where(
        and(
          eq(campaigns.tenantId, tenantId),
          eq(campaigns.id, campaignId)
        )
      )
      .returning()

    return updated
}

// Deleted
export const deleteCampaign = async (
    tenantId : string,
    campaignId: string
)=>{
    await getCampaignById(tenantId, campaignId)

    await db
     .delete(campaigns)
     .where(
        and(
            eq(campaigns.tenantId , tenantId),
            eq(campaigns.id , campaignId)
        )
     )
     return {message: "campaign deleted successfully"}
}

// sending 
export const sendCampaign = async (tenantId: string, campaignId: string)=>{
    const campaign = await getCampaignById(tenantId, campaignId)

    if(campaign.status ==='sending' || getCampaignById.status ==='sent'){
        throw new AppError('Campaign is already sending or has been sent', 400)
    }

    const pendingContacts = await db
    .select()
    .from(contacts)
    .where(
        and(
            eq(contacts.campaignId, campaignId),
            eq(contacts.status, 'pending'),
            eq(contacts.unsubscribed, false)
        )
    )

    if (!pendingContacts.length) {
        throw new AppError('No pending contacts found for this campaign', 400)
      }
    
    await db 
     .update(campaigns)
     .set({status : 'sending' , updatedAt: new Date()})
     .where(eq(campaigns.id , campaignId))
    
    await Promise.all(
        pendingContacts.map((contact) =>
            emailQueue.add({
              contactId: contact.id,
              campaignId: campaign.id,
              tenantId,
              to: contact.email,
              subject: campaign.subject,
              body: campaign.body,
              firstName: contact.firstName,
            })
          )
    )

    return {
        message: 'Campaign sending started',
        totalJobs: pendingContacts.length,
      }
}