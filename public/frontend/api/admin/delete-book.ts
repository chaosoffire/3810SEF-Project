import type express from "express";
const apiVersion = process.env.API_VERSION_NO as string | null;

export const deleteBook = async(req:express.Request, res:express.Response) => {
    const response:Response = await fetch(`${req.protocol}://${req.get("host")}/api/${apiVersion!}/book/${req.params.id}`,{
        method:"DELETE",
        headers:{
            "Cookie":req.headers.cookie||""
        }
    });

    if(response.ok){
        return res.sendStatus(200);
    }else{
        return res.sendStatus(500);
    }
}