import type express from "express";

import type * as interfaces from "../../Interface/interface";
const apiVersion = process.env.API_VERSION_NO as string | null;


export const getOwnBook = async(req: express.Request, res: express.Response) => {
    const response:Response = await fetch(`${req.protocol}://${req.get("host")}/api/${apiVersion}/user/ownbooks`,{
        method:"GET",
        headers:{
            "Content-Type": "application/json",
            "Cookie": req.headers.cookie||""
        }
    });

    if(response.ok){
        const result: interfaces.ownBookResult = await response.json();
        return res.status(200).json(result);
    }else{
        return res.status(404);
    }
}