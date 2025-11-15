import express from "express";
import "dotenv/config";
import { upload } from "./multer";

import { addBook } from "./api/admin/add-book";
import { signIn } from "./api/auth/sign-in";
import { signOut } from "./api/auth/sign-out";
import { signUp } from "./api/auth/sign-up";
import { renderContent } from "./api/general/render-content";
import { checkAdmin } from "./middleware/check-admin";
import { checkRole } from "./middleware/check-role";
import { validateSession } from "./middleware/validate-session";

export const pageRouter = express.Router({
    mergeParams: true,
});
//
const _apiVersion = process.env.API_VERSION_NO as string | null;

pageRouter.get(
    "/", 
    async (_req: express.Request, res: express.Response) => {
    res.redirect("/credential");
});

pageRouter.get(
    "/credential",
    async (_req: express.Request, res: express.Response) => {
        res.status(200).render("login");
    },
);

// send api get book for starting menu
pageRouter.get(
    "/content", 
    validateSession, 
    checkRole, 
    renderContent
);

pageRouter.post(
    "/signup", 
    signUp
);

pageRouter.post(
    "/adminsignup", 
    validateSession, 
    signUp
);

pageRouter.post(
    "/signin", 
    signIn
);

pageRouter.post(
    "/signout", 
    validateSession, 
    signOut
);

pageRouter.post(
    "/add",
    validateSession,
    checkAdmin,
    upload.single("book-cover-upload"),
    addBook,
);
