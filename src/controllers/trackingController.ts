import { NextFunction, Request, Response } from 'express'
import { trackOpen, trackClick } from '../services/trackingService'

export const handleOpen = async (req: Request, res: Response) => {
    try{
        const {cid , tid} = req.query
        
        if(cid && tid){
            await trackOpen(cid as string , tid as string)
        }
    }catch{

    }finally{
        const pixel = Buffer.from(
            'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
            'base64'
        )

        res.writeHead(200, {
            'content-type' : 'image/gif',
            'Content-Length': pixel.length,
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
        })

        res.send(pixel)
    }
}

export const handleClick = async (req: Request , res: Response , next: NextFunction)=>{
    const { url, cid, tid } = req.query

    const redirectUrl = url as string || 'https://google.com'

    try{
        if(cid && tid){
            await trackClick(cid as string , tid as string)
        }

    }catch{

    }finally{
        res.redirect(302, redirectUrl)
    }

}