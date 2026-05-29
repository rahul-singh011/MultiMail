import { db } from '../db/client'
import { contacts } from '../db/schema/contacts'
import { campaigns } from '../db/schema/campaigns'
import { eq, sql } from 'drizzle-orm'
import { sendEmail } from '../utils/mailer'
import emailQueue, { EmailJobData } from './emailQueue'
import { getIO } from '../socket'

const emitProgress = async (campaignId: string) => {
  const io = getIO()

   if (!io) return

  const [campaign] = await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.id, campaignId))
    .limit(1)

  if (!campaign) return

  io.to(campaignId).emit('campaignProgress', {
    campaignId,
    sent: campaign.sentCount,
    failed: campaign.failedCount,
    total: campaign.totalRecipients,
    status: campaign.status,
  })

  const allProcessed =
    (campaign.sentCount ?? 0) + (campaign.failedCount ?? 0) >= (campaign.totalRecipients ?? 0)

  if (allProcessed && campaign.status !== 'sent') {

    await db
      .update(campaigns)
      .set({ status: 'sent', updatedAt: new Date() })
      .where(eq(campaigns.id, campaignId))

    io.to(campaignId).emit('campaignComplete', {
      campaignId,
      sent: campaign.sentCount,
      failed: campaign.failedCount,
      total: campaign.totalRecipients,
    })

    console.log(`Campaign ${campaignId} completed`)
  }
}

emailQueue.process(5, async (job) => {
  const { contactId, campaignId, to, subject, body, firstName } = job.data

  try {
    await sendEmail({ to, subject, body, firstName, contactId, campaignId })

    await db
      .update(contacts)
      .set({ status: 'sent' })
      .where(eq(contacts.id, contactId))

    await db
      .update(campaigns)
      .set({
        sentCount: sql`${campaigns.sentCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(campaigns.id, campaignId))

  } catch (err) {
    await db
      .update(contacts)
      .set({ status: 'failed' })
      .where(eq(contacts.id, contactId))

    await db
      .update(campaigns)
      .set({
        failedCount: sql`${campaigns.failedCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(campaigns.id, campaignId))

    throw err
  } finally {

    await emitProgress(campaignId)
  }
})

console.log('Emails worker is running...')