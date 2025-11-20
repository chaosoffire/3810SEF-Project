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
import { getOwnBook } from "./api/user/get-owned-book";
import { checkout } from "./api/user/checkout";
import { bookContent } from "./api/user/book-content";
import { resetPassword } from "./api/auth/reset-password";
import { deleteBook } from "./api/admin/delete-book";
import { updateBook } from "./api/admin/update-book";

export const pageRouter = express.Router({
    mergeParams: true,
});

const apiVersion = process.env.API_VERSION_NO as string | null;
const testPath = process.env.TEST_PATH as string | null;

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

pageRouter.get(
    "/ownedbook",
    validateSession,
    getOwnBook
)

// send api get book for starting menu
pageRouter.get(
    "/content", 
    validateSession, 
    checkRole, 
    renderContent
);

pageRouter.get(
    "/bookcontent",
    validateSession,
    bookContent
);

// ----------------------------LIST USER
// pageRouter.get(
//     "/users",
//     validateSession,
//     checkAdmin,
//     async(req:express.Request,res:express.Response) => {
//         const response:Response = await fetch(`/api/${apiVersion}/test/${testPath}/users`,{
//             method:"GET"
//         })

//         if(response.ok){
//             const result:any = await response.json();
//             console.log(result);
//             res.status(200).json({result});
//         }

//     }
// )

// -------------------------------------------

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

pageRouter.post(
    "/update/:id",
    validateSession,
    checkAdmin,
    updateBook
)

pageRouter.post(
    "/checkout",
    validateSession,
    checkout
)

pageRouter.put(
    "/reset",
    validateSession,
    resetPassword
)


pageRouter.delete(
    "/delete/:id",
    validateSession,
    deleteBook
)
