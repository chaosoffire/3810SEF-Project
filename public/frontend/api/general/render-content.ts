import type express from "express";

import type * as interfaces from "../../Interface/interface";

const apiVersion = process.env.API_VERSION_NO as string | null;

export const renderContent = async (
    req: express.Request,
    res: express.Response,
) => {
    if (req.query.state === "home") {
        const str:string = req.query.requestQuery
            ? (req.query.requestQuery as string)
            : "sortBy.title|sortOrder.asc|limit.10|start.0"; 
        
        const patternForOffsets:RegExp = /\|start\.\d+/g;
        let storedQuery:string = str.replace(patternForOffsets, '');


        const offsetMatch = str.match(/\|start\.(\d+)/) as RegExpMatchArray;
        const offset: number = offsetMatch ? parseInt(offsetMatch[1]) : 0;
        const currentPage:number = Math.floor(offset / 10) + 1; 

        const andChar: string = str.replaceAll("|", "&");
        const equalChar:string = andChar.replaceAll(".", "=");
        
        const response: Response = await fetch(
            `${req.protocol}://${req.get("host")}/api/${apiVersion}/book?${equalChar}`,
            {
                method: "GET",
                headers: { Cookie: req.headers.cookie || "" },
            },
        );
        
        if (response.ok) {
            const bookData: interfaces.bookResult = await response.json();
            const totalPages:number = Math.ceil((bookData.count || 0) / 10);

            let startPage: number;
            
            if (totalPages <= 3 || currentPage <= 2) {
                startPage = 1;
            } else if (currentPage >= totalPages - 1) {
                startPage = Math.max(1, totalPages - 2); 
            } else {
                startPage = currentPage - 1; 
            }
            startPage = Math.max(1, startPage);
            const endPage:number = Math.min(totalPages, startPage + 2);
            

            res.status(200).render("menu", {
                state: req.query.state,
                role: req.role,
                books: bookData,
                previousQuery: storedQuery,  
                currentPage: currentPage,   
                startPage: startPage,       
                endPage: endPage,       
            });
        } else {

            res.status(404).render("menu", {
                state: req.query.state,
                role: req.role,
                previousQuery: storedQuery,
                books: { count: 0 },
                currentPage: 1,
                startPage: 1,
                endPage: 1,
            });
        }
    } else {

        res.status(200).render("menu", {
            state: req.query.state,
            role: req.role,
        });
    }
};