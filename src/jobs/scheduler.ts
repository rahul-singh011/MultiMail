import cron from 'node-cron'
import {db} from '../db/client'
import { campaigns } from '../db/schema/campaigns'
import {eq , lte , and, gt} from 'drizzle-orm'
import { sendCampaign } from '../services/campaignService'


export const startScheduler = ()=>{

    cron.schedule('* * * * *', async ()=>{
        console.log('Scheduler checking for due campaigns...')

        try{
            const dueCampaigns = await db
             .select()
             .from(campaigns)
             .where(
                and(
                    eq(campaigns.status, 'draft'),
                    lte(campaigns.scheduledAt, new Date()),
                    gt(campaigns.totalRecipients, 0)
                )
             )

             if(!dueCampaigns.length){
                console.log('No campaigns due.')
                return
             }

            console.log(`Found ${dueCampaigns.length} campaign(s) due — triggering send...`)

            await Promise.all(
                dueCampaigns.map((campaign)=>{
                    sendCampaign(campaign.tenantId, campaign.id)
                     .then(()=> console.log(`✓ Campaign "${campaign.name}" triggered`))
                     .catch((err)=> console.error(`x failed to trigger "${campaign.name}":`, err.message))
                })
            )

        }catch(err: any){
            console.error('Scheduler error:', err.message)
        }
    })

    console.log('Scheduler started - checking every minute for due campaigns')
}