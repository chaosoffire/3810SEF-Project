import express from "express";
import 'dotenv/config';

import { upload } from "./multer";
import { signUp } from "./api/auth/sign-up";
import { signIn } from "./api/auth/sign-in";
import {signOut} from "./api/auth/sign-out";
import { addBook } from "./api/admin/add-book";
import { showBook } from "./api/general/show-book";


import { checkRole } from "./middleware/check-role";
import { checkAdmin } from "./middleware/check-admin";
import { validateSession } from "./middleware/validate-session";

import * as interfaces from "./Interface/interface";
export const pageRouter = express.Router({ mergeParams: true });
// 
const apiVersion = process.env.API_VERSION_NO as string|null;

pageRouter.get("/", async (req: express.Request, res: express.Response) => {
    res.redirect("/credential");
});


pageRouter.get("/credential", async (req: express.Request, res: express.Response) => {
    res.status(200).render("login");
});

pageRouter.get("/content", validateSession, checkRole, async (req: express.Request, res: express.Response) => {
    if(req.query.state === "home"){
        const query = "sortBy=title&sortOrder=asc";
    
        const response: Response = await fetch(`${req.protocol}://${req.get("host")}/api/${apiVersion}/book?${query}`,{
            method:"GET",
            headers:{"Cookie":req.headers.cookie||""}
        });
    
        const bookData:interfaces.bookResult = await response.json();
        console.log(bookData);
        res.status(200).render("menu",{state:req.query.state,role:req.role,books:bookData});
    }else{
        res.status(200).render("menu",{state:req.query.state,role:req.role});
    }
});

pageRouter.get("/book",validateSession, showBook);

pageRouter.post("/signup", signUp);

pageRouter.post("/adminsignup", validateSession, signUp);

pageRouter.post("/signin", signIn);

pageRouter.post("/signout", validateSession, signOut);

pageRouter.post("/add", validateSession, checkAdmin, upload.single('book-cover-upload'), addBook);
