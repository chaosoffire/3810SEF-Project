import express from "express";
import 'dotenv/config';
export const pageRouter = express.Router({ mergeParams: true });
// 
const apiVersion = process.env.API_VERSION_NO;
const host = process.env.HOST;
const port = process.env.PORT;

pageRouter.get("/", async (req: express.Request, res: express.Response) => {
    console.log("Page router accessed");
    res.redirect("/credential");
});


pageRouter.get("/credential", async (req: express.Request, res: express.Response) => {
    console.log("Rendering login page");
    res.status(200).render("login");
});


// code correct but validation needs to adjust in input validation

// onclick input validate -> ok -> send reqest to sign up to check user id duplication -> ok -> redirect to page with success message
pageRouter.post("/signup", async (req: express.Request, res: express.Response) => {
    try{

        const payload: Object = {
            username:req.body.id,
            password:req.body.password,
            admin:false
        }

        const response = await fetch(`http://${host}:${port}/api/${apiVersion}/user/register`,{
            method:"POST",
            headers: {'Content-Type': 'application/json'},
            body:JSON.stringify(payload)
        });

        if(response.status === 201){
            res.redirect("/page/credential?signUpSuccess=true");
        }else{
            throw {status:response.status};
        }
    }catch(error:any){
        let message:String;
        if(error.status === 403){
            message = "You have no access to admin account creation.";
        }else if(error.status === 409){
            message = "User ID already existed, please choose another one.";
        }else{
            message = `Something wrong happened when signing up, please try again: code ${error.status}`;
        }
        res.redirect(`/page/credential?signUpSuccess=false&message=${message}`);
    }

});
