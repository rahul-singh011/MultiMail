import { Request, Response, NextFunction } from 'express'
import { validationResult } from 'express-validator'
import { registerTenant, loginTenant } from '../services/authService'
import { sendSuccess, sendError } from '../utils/response'


export const register = async (
    req: Request,
    res: Response,
    next: NextFunction
) =>{
    try{

        const errors = validationResult(req)
        if(!errors.isEmpty()){
            return sendError(res, 'Validation failed', 422, errors.array())
        }

        const {name, email , password} = req.body
        const result = await registerTenant(name,email ,password)
        return sendSuccess(res, result, 'Tenant registered successfully', 201)

    }catch(err){
        next(err)
    }
}

export const login = async (
    req: Request,
    res: Response,
    next: NextFunction
) =>{
   try{
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        return sendError(res, 'Validation failed', 422 , errors.array())     
    }

    const {email, password} = req.body
    const result = await loginTenant(email,password)
    return sendSuccess(res, result , 'Login Successful')
   }
   catch(err){
    next(err)
   } 
}