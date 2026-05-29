import { Request, Response, NextFunction } from 'express'
import { validationResult } from 'express-validator'
import { sendSuccess, sendError } from '../utils/response'
import { addContacts, getContacts } from '../services/contactService'


export const add = async (req: Request , res: Response , next: NextFunction)=>{
    try{
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return sendError(res, 'Validation failed', 422, errors.array())
        }

        const tenantId = req.tenant.id
        const campaignId = req.params.id as string

        const {contacts} = req.body

        const result = await addContacts(tenantId, campaignId , contacts)

        return sendSuccess(res, result ,  'Contacts added successfully', 201)
    
    } catch(err){
        next(err)
    }
}

export const list = async(req: Request, res: Response, next: NextFunction)=>{
    try{
        const tenantId = req.tenant.id
    const campaignId = req.params.id as string

    const result = await getContacts(tenantId, campaignId)
    
    return sendSuccess(res, result , 'Contacts fetched')
    }catch(err){
        next(err)
        
    }
}