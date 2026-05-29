import { Request, Response, NextFunction } from 'express'
import {AppError} from '../utils/errors'
import {sendError} from '../utils/response'

export const errorHandler  = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
)=>{
    if (err instanceof AppError){
        return sendError(res, err.message , err.statusCode)
    }

    console.error('UNHANDLED ERROR:',err)
    return sendError(res, 'Internal server error', 500)
}
