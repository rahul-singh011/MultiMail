import {Request, Response, NextFunction} from 'express'
import {validationResult} from 'express-validator'
import {sendSuccess , sendError} from '../utils/response'
import {
    createCampaign,
    getCampaigns,
    getCampaignById,
    updateCampaign,
    deleteCampaign,
    sendCampaign
} from '../services/campaignService'


export const create = async (
    req: Request,
    res: Response,
    next: NextFunction
)=>{
    try{
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
          return sendError(res, 'Validation failed', 422, errors.array())
        }

        const tenantId = req.tenant.id
        const {name, subject, body, scheduledAt} = req.body

        const campaign = await createCampaign(tenantId, {
            name,
            subject,
            body,
            scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
          })
          return sendSuccess(res, campaign, 'Campaign created', 201)

    }catch(err){
        next(err)
    }
}

export const list = async (req: Request , res: Response, next: NextFunction)=>{
    try{
        const tenantId = req.tenant.id
        const campaigns = await getCampaigns(tenantId)

        return sendSuccess(res, campaigns, 'Campaigns fetched')
    }catch(err){
        next(err)
    }
}

export const getOne = async (
    req: Request,
    res: Response,
    next: NextFunction
)=>{
    try{
    const tenantId = req.tenant.id
    const campaignId = req.params.id as string
    const campaign = await getCampaignById(tenantId, campaignId)

    return sendSuccess(res, campaign, 'Campaign fetched')
    }catch(err){
        next(err)
    }
}

export const update = async (
    req: Request,
    res: Response, 
    next: NextFunction
)=>{
    try{
        const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return sendError(res, 'Validation failed', 422, errors.array())
    }

    const tenantId = req.tenant.id
    const campaignId = req.params.id as string
    const { name, subject, body, scheduledAt } = req.body

    const updated = await updateCampaign(tenantId, campaignId, {
        ...(name && { name }),
        ...(subject && { subject }),
        ...(body && { body }),
        ...(scheduledAt && { scheduledAt: new Date(scheduledAt) }),
      })

    return sendSuccess(res, updated, 'Campaign updated')

    }catch(err){
        next(err)
    }
}

export const remove = async (
    req: Request,
    res: Response,
    next: NextFunction
)=>{
    try{
        const tenantId = req.tenant.id
        const campaignId = req.params.id as string

        const result = await deleteCampaign(tenantId, campaignId)
        
        return sendSuccess(res,result, 'campaign deleted')
    }catch(err){
        next(err)
    }
}

export const send = async(
    req: Request,
    res: Response,
    next: NextFunction
)=>{
    try{
        const tenantId = req.tenant.id
        const campaignId = req.params.id as string

        const result = await sendCampaign(tenantId, campaignId)

        return sendSuccess(res,result , 'Campaign sending started')
    }catch(err){
        next(err)
    }
}