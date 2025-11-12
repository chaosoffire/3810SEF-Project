import type express from "express";

import type * as interfaces from "../../Interface/interface";

const apiVersion = process.env.API_VERSION_NO as string | null;
const sessionTime = process.env.SESSION_TIMEOUT as string | null;

export const signIn = async (req: express.Request, res: express.Response) => {
    try {
        const payload: interfaces.signInPayload = {
            username: req.body.username,
            password: req.body.password,
        };

        const response: Response = await fetch(
            `${req.protocol}://${req.get("host")}/api/${apiVersion!}/user/login`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            },
        );

        const result = (await response.json()) as interfaces.signInResult;

        if (!response.ok) {
            throw {
                status: response.status,
                success: result.success,
                error: result.error,
            };
        } else {
            // check role -> return menu

            const cookieString: string = response.headers.getSetCookie()[0];

            if (cookieString) {
                res.setHeader("set-cookie", cookieString);
                const expirationDate: Date = new Date(
                    Date.now() + parseInt(sessionTime!, 10),
                );
                res.cookie("expirationDate", expirationDate);
            }
            res.redirect(`/page/content?state=home`);
        }
    } catch (e: any) {
        if (e.status === 401) {
            res.redirect(`/page/credential?error=${e.status}`);
        } else {
            res.redirect(`/page/credential?error=other`);
        }
    }
};
