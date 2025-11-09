import express from "express";
import 'dotenv/config';

import { upload } from "./multer";
import { signUp } from "./api/auth/sign-up";
import { signIn } from "./api/auth/sign-in";
import {signOut} from "./api/auth/sign-out";
import { addBook } from "./api/admin/add-book";

import { validateSession } from "./middleware/validate-session";
import { checkRole } from "./middleware/check-role";
import { checkAdmin } from "./middleware/check-admin";
export const pageRouter = express.Router({ mergeParams: true });
// 
const apiVersion = process.env.API_VERSION_NO as string|null;

pageRouter.get("/", async (req: express.Request, res: express.Response) => {
    console.log("Page router accessed");
    res.redirect("/credential");
});


pageRouter.get("/credential", async (req: express.Request, res: express.Response) => {
    console.log("Rendering login page");
    res.status(200).render("login");
});

pageRouter.get("/content", validateSession, checkRole, async (req: express.Request, res: express.Response) => {
    console.log("Rendering login page");
    console.log("role", req.role);
    res.status(200).render("menu",{state:req.query.state,role:req.role});
});

pageRouter.post("/signup", validateSession, signUp);

pageRouter.post("/signin", signIn);

pageRouter.post("/signout", validateSession, signOut);

pageRouter.post("/add", validateSession, checkAdmin, upload.single('book-cover-upload'), addBook);
