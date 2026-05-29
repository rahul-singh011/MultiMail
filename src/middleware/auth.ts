import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { db } from '../db/client'
import { apiKeys } from '../db/schema/apiKeys'
import { eq } from 'drizzle-orm'
import { env } from '../config/env'
import { AppError } from '../utils/errors'

declare global {
    namespace Express {
      interface Request {
        tenant?: any    
        tenantId?: string 
      }
    }
  }

  export const requireJWT = (
    req: Request,
    res: Response,
    next: NextFunction
  )=>{
    const token = req.headers.authorization?.split(' ')[1]
    if(!token) throw new AppError('No token provided', 401)

    try{
      const decoded = jwt.verify(token , env.JWT_SECRET) as any
      req.tenant = decoded
      next()
    }catch{
      throw new AppError('Invalied or Expied token', 401)
    }
  }

  export const requireApiKey = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) =>{
    const key = req.headers['x-api-key'] as string
    if(!key) throw new AppError('No API key provided', 401)

    const result = await db
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.key, key))
    .limit(1)

    if(!result.length || !result[0].isActive){
      throw new AppError('Invalid API key', 401)
    }

    req.tenantId = result[0].tenantId  
    next()
  }