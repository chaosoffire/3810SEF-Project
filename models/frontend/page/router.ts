import express from "express";

export const pageRouter = express.Router({ mergeParams: true });

// pageRouter.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
//     res.set('Content-Security-Policy', "default-src 'none'; connect-src 'self';");
//     next();
// });

pageRouter.get("/", async (req: express.Request, res: express.Response) => {
    console.log("Page router accessed");
    res.redirect("/credential");
});

pageRouter.get("/credential", async (req: express.Request, res: express.Response) => {
    console.log("Rendering login page");
    res.status(200).render("login");
});
