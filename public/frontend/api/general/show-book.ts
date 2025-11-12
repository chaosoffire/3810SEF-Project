import type express from "express";

import type * as interfaces from "../../Interface/interface";

const apiVersion = process.env.API_VERSION_NO as string | null;

export const showBook = async (req: express.Request, res: express.Response) => {
    try {
        const str = req.query.requestQuery
            ? (req.query.requestQuery as string)
            : "sortBy.title|sortOrder.asc";
        const andChar = str.replaceAll("|", "&");
        const equalChar = andChar.replaceAll(".", "=");
        const response: Response = await fetch(
            `${req.protocol}://${req.get("host")}/api/${apiVersion}/book?` +
                equalChar,
            {
                method: "GET",
                headers: {
                    Cookie: req.headers.cookie || "",
                },
            },
        );

        if (response.ok) {
            const result = (await response.json()) as interfaces.bookResult;
            return res.status(200).json(result.data);
        } else {
            throw {
                status: response.status,
            };
        }
    } catch (_e: any) {
        return res.status(404);
    }
};
