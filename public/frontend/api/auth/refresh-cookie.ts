import express from "express";
import * as interfaces from "../../Interface/interface";
const apiVersion = process.env.API_VERSION_NO as string|null;
const sessionTime = process.env.SESSION_TIMEOUT as string|null;


export const refreshCookie = async(req:express.Request,res:express.Response) => {
    try{
        const response:Response = await fetch(`${req.protocol}://${req.get("host")}/api/${apiVersion!}/user/refresh-cookie`,{
            method:"POST",
            headers:{'Cookie':req.headers.cookie || ""}
        });
        
        if(response.ok){
            const cookieString: string = response.headers.getSetCookie()[0];
            
            if(cookieString){
                res.setHeader('set-cookie',cookieString);
                const expirationDate:Date = new Date(Date.now() + parseInt(sessionTime!));
                res.cookie('expirationDate',expirationDate);
            }

            return true;
        }else{
            return false;
        }
    }catch(e:any){
        return false;
    }
}