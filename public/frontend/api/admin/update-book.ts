import type express from "express";
import type * as interfaces from "../../Interface/interface"
import sizeOf from "image-size";
const apiVersion = process.env.API_VERSION_NO as string | null;

export const updateBook = async(req:express.Request, res:express.Response) => {
    const author:string = req.body.author;
    const categories:string[] = req.body.categories;
    const title:string = req.body.title;
    const description:string = req.body.description;
    const price:string = req.body.price;
    const publishedYear:string = req.body.publishedYear
    const previous:string = req.body.previous

    let coverImageBase64 = previous;


    const genres = Array.isArray(categories)
        ? categories
        : categories
            ? [
                categories,
            ]
            : [];

    const newBookData = {
        title,
        author,
        description,
        genres: genres,
        publishedYear,
        price,
        coverImage: coverImageBase64,
    };
    console.log(newBookData);
    const response:Response = await fetch(`${req.protocol}://${req.get("host")}/api/${apiVersion!}/book/${req.params.id}`,{
        method:"PUT",
        headers:{
            "Content-Type":"application/json",
            "Cookie":req.headers.cookie||""
        },
        body:JSON.stringify({
            title:newBookData.title,
            author: newBookData.author,
            description: newBookData.description,
            genres: newBookData.genres,
            publishedYear: newBookData.publishedYear,
            price: newBookData.price,
            coverImage: newBookData.coverImage
        })
    });

    if(response.ok){
        return res.sendStatus(200);
    }else{
        return res.sendStatus(400);
    }
}