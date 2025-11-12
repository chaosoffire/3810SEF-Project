import type express from "express";

import type * as interfaces from "../../Interface/interface";

const apiVersion = process.env.API_VERSION_NO as string | null;

export const renderContent = async (
    req: express.Request,
    res: express.Response,
) => {
    if (req.query.state === "home") {
        const str = req.query.requestQuery
            ? (req.query.requestQuery as string)
            : "sortBy=title&sortOrder=asc";

        const andChar = str.replaceAll("|", "&");
        const equalChar = andChar.replaceAll(".", "=");

        const response: Response = await fetch(
            `${req.protocol}://${req.get("host")}/api/${apiVersion}/book?${equalChar}`,
            {
                method: "GET",
                headers: {
                    Cookie: req.headers.cookie || "",
                },
            },
        );
        if (response.ok) {
            const bookData: interfaces.bookResult = await response.json();
            res.status(200).render("menu", {
                state: req.query.state,
                role: req.role,
                books: bookData,
            });
        } else {
            res.status(404).render("menu", {
                state: req.query.state,
                role: req.role,
            });
        }
    } else {
        res.status(200).render("menu", {
            state: req.query.state,
            role: req.role,
        });
    }
};
