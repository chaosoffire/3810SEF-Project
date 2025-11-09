import express from "express";
import * as interfaces from "../../Interface/interface";
import { Admin } from "mongodb";
const apiVersion = process.env.API_VERSION_NO as string|null;

export const signUp = async (req: express.Request, res: express.Response): Promise<void> => {
        try{
    
            const payload: interfaces.signUpPayload = {
                username:req.body.username,
                password:req.body.password,
                admin:req.body.admin || false
            }
            

            console.log("signuppayload",payload);

            const header:Record<string,string> = {'Content-Type': 'application/json'};
            if(payload.admin && req.headers.cookie){
                header['Cookie'] = req.headers.cookie;
            }


            const response: Response = await fetch(`${req.protocol}://${req.get("host")}/api/${apiVersion!}/user/register`,{
                method:"POST",
                headers: header,
                body:JSON.stringify(payload)
            });
            if(!req.body.admin){
                if(response.status === 201){
                    res.redirect("/page/credential?signUpSuccess=true");
                }else{
                    const result = await response.json() as interfaces.signUpError;
                    
                    throw{
                        status:response.status,
                        message:result.error,
                        admin:req.body.admin
                    };
                }
            }else{
                if(response.status === 201){
                    res.status(201);
                }else{
                    const result = await response.json() as interfaces.signUpError;

                    throw{
                        status:response.status,
                        message:result.error,
                        admin:req.body.admin
                    }
                }
            }
        }catch(e:any){
            const message:string = e.message + " code: " + e.status;
            if(!e.admin){
                res.redirect(`/page/credential?signUpSuccess=false&message=${message}`);
            }else{
                res.status(e.status).json({status:false, error:e.message});
            }
        }
};