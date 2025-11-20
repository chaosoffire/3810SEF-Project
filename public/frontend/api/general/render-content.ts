import type express from "express";

import type * as interfaces from "../../Interface/interface";

const apiVersion = process.env.API_VERSION_NO as string | null;

export const renderContent = async (
    req: express.Request,
    res: express.Response,
) => {
    if (req.query.state === "home") {
        // home page
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
            
            console.log(bookData);
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

    } else if(req.query.state === "description"){
        console.log(req.query.id);
        const response: Response = await fetch(`${req.protocol}://${req.get("host")}/api/${apiVersion}/book/${req.query.id}`,{
            method:"GET",
            headers:{
                "Content-Type": "application/json",
                "Cookie": req.headers.cookie||""
            }
        });

        if(response.ok){
            const result = await response.json() as interfaces.singleBook;
            console.log(result);
            res.status(200).render("menu",{
                state: req.query.state,
                role: req.role,
                book: {
                    _id:req.query.id,
                    title: result.data.title,
                    author: result.data.author,
                    description: result.data.description,
                    genres: result.data.genres,
                    publishedYear: result.data.publishedYear,
                    price: result.data.price,
                    coverImage: result.data.coverImage
                }
            });
        }else{
            const q = document.querySelector("#base-book-query") as HTMLInputElement;
            window.alert("Failed to fetch book data");
            window.location.href = `${req.protocol}://${req.get("host")}/page/content?state=home&requestQuery=${q.value}`;
        }
    }else if(req.query.state === "mybooks"){
        try{
            const ownBookListResponse:Response = await fetch(`${req.protocol}://${req.get("host")}/api/${apiVersion}/user/ownbooks`,{
                method:"GET",
                headers: {
                    "Cookie": req.headers.cookie||"",
                    "Content-Type": "application/json"
                }
            });

            if(ownBookListResponse.ok){
                const ownbooks:interfaces.ownBookResult = await ownBookListResponse.json();
                if(ownbooks.books.length > 0){
                    const total:number = ownbooks.books.length;
                    const totalPage:number = Math.ceil(total/10);
                    const currentPage:number = req.query.current? parseInt(req.query.current as string): 1;
                    
                    let startPage;

                    if(currentPage <= 2){
                        startPage = 1;
                    }else if(currentPage >= totalPage - 1){
                        startPage = Math.max(1,totalPage - 2);
                    }else{
                        startPage = currentPage - 1;
                    }
                    let endPage = Math.min(totalPage, startPage + 2);
                    
                    const query:string = `bookid=${ownbooks.books.slice(10*(currentPage-1),10*(currentPage-1)+10)}`;

                    const booksDetailsResponse: Response = await fetch(`${req.protocol}://${req.get("host")}/api/${apiVersion}/book?${query}`,{
                        method:"GET",
                        headers: {
                            "Cookie": req.headers.cookie||"",
                            "Content-Type": "application/json"
                        }   
                    });
                    if(booksDetailsResponse.ok){
                        const booksDetails: interfaces.bookResult = await booksDetailsResponse.json();
                        console.log(booksDetails);
                        res.status(200).render("menu",{
                            state: req.query.state,
                            role: req.role,
                            books: booksDetails.data,
                            totalPage:totalPage,
                            currentPage: currentPage,   
                            startPage: startPage,       
                            endPage: endPage, 
                        });
                    }else{
                        throw {};
                    }
                }else{
                    throw {};
                }
            }else{
                throw {};
            }
        }catch(e:unknown){
            res.status(200).render("menu",{
                state: req.query.state,
                role: req.role,
                books: [],
                totalPage: 0,
                currentPage: 0,   
                startPage: 0,       
                endPage: 0, 
            });
        }
    }else{
        // other pages
        res.status(200).render("menu", {
            state: req.query.state,
            role: req.role,
        });
    }
};