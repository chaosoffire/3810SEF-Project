import type express from "express";

// import "express";
import { getRole } from "../api/auth/get-role";
// import { RoleRequest } from "../Interface/interface";

export const checkRole = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
) => {
    console.log("checking role");

    const role: string = await getRole(req, res);

    if (role !== "") {
        req.role = role;
        next();
    } else {
        res.clearCookie("x-session");
        res.clearCookie("expirationDate");
        res.redirect("/page/credential");
    }
};
