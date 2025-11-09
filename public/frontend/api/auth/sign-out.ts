import express from "express";
import * as interfaces from "../../Interface/interface";
const apiVersion = process.env.API_VERSION_NO as string|null;

export const signOut = async(req:express.Request, res:express.Response) => {
    try{
        const response: Response = await fetch(`${req.protocol}://${req.get("host")}/api/${apiVersion!}/user/logout`,{
            method:'POST',
            headers:{
                'Cookie':req.headers.cookie||''
            }
        });
    
        if(response.ok){
            res.clearCookie('x-session');
            res.clearCookie('expirationDate');
            res.redirect('/page/credential');
        }else{
            throw {
                status: response.status
            };
        }
    }catch(e:any){
        console.log("logout failed");
    }
}