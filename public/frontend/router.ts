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
import { renderContent } from "./api/general/render-content";
export const pageRouter = express.Router({ mergeParams: true });
// 
const apiVersion = process.env.API_VERSION_NO as string|null;

pageRouter.get("/", async (req: express.Request, res: express.Response) => {
    res.redirect("/credential");
});


pageRouter.get("/credential", async (req: express.Request, res: express.Response) => {
    res.status(200).render("login");
});

// send api get book for starting menu
pageRouter.get("/content", validateSession, checkRole, renderContent);
// 
// pageRouter.get("/book",validateSession, showBook);

pageRouter.post("/signup", signUp);

pageRouter.post("/adminsignup", validateSession, signUp);

pageRouter.post("/signin", signIn);

pageRouter.post("/signout", validateSession, signOut);

pageRouter.post("/add", validateSession, checkAdmin, upload.single('book-cover-upload'), addBook);
