import type express from "express";

import type * as interfaces from "../../Interface/interface";

const apiVersion = process.env.API_VERSION_NO as string | null;

export const getRole = async (req: express.Request, _res: express.Response) => {
    try {
        const roleResponse = await fetch(
            `${req.protocol}://${req.get("host")}/api/${apiVersion!}/user/isAdmin`,
            {
                method: "GET",
                headers: {
                    Cookie: req.headers.cookie || "",
                },
            },
        );

        if (roleResponse.ok) {
            const roleResult =
                (await roleResponse.json()) as interfaces.getRoleResult;
            console.log(roleResult);
            const role: string = roleResult.isAdmin ? "admin" : "user";

            return role;
        } else {
            throw {};
        }
    } catch (_e: any) {
        return "";
    }
};
