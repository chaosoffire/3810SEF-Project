import express from "express";
import { refreshCookie } from "../api/auth/refresh-cookie";
export const validateSession = async(req:express.Request,res:express.Response,next:express.NextFunction) => {
    if(req.body.admin){
            console.log("validating session");
            if(req.cookies['x-session'] && (new Date(req.cookies['expirationDate']).getTime() > Date.now())){
                if((new Date(req.cookies['expirationDate']).getTime() - Date.now()) <= (5*60*1000)){
                    const result = await refreshCookie(req,res);
                    if (result){
                        next();
                    }else{            
                        res.clearCookie('x-session');
                        res.clearCookie('expirationDate');
                        res.redirect("/page/credential");
                    }
                }
                else{
                    next();
                }
            }else{
                res.clearCookie('x-session');
                res.clearCookie('expirationDate');
                res.redirect("/page/credential");
            }
        }else{
            next();
        }
};