import express from "express";
import sizeOf from "image-size";

const apiVersion = process.env.API_VERSION_NO as string|null;

export const addBook = async(req:express.Request,res:express.Response) => {
    const { title, author, description, price, categories, publishedYear } = req.body;
    let coverImageBase64 = "";

    if (req.file) {
        // Validate image dimensions
        const dimensions = sizeOf(req.file.buffer);
        if (dimensions.width > 1000 || dimensions.height > 1000) {
            return res.status(400).json({ success: false, message: "Image dimensions should not exceed 1000x1000 pixels." });
        }
        const aspectRatio = dimensions.width / dimensions.height;
        if (aspectRatio < 0.6 || aspectRatio > 0.7) { // 2:3 aspect ratio
            return res.status(400).json({ success: false, message: "Image aspect ratio should be approximately 2:3." });
        }
        // Convert to base64 
        coverImageBase64 = req.file.buffer.toString('base64');
    } else {
        return res.status(400).json({ success: false, message: "Book cover image is required." });
    }

    try {
        // Normalize categories to always be an array
        const genres = Array.isArray(categories) ? categories : (categories ? [categories] : []);

        const newBookData = {
            title,
            author,
            description,
            genres: genres, 
            publishedYear,
            price,
            coverImage: coverImageBase64 
        };

        // Call API to add a new book
        const response:Response = await fetch(`${req.protocol}://${req.get("host")}/api/${apiVersion!}/book`,{
            method:"POST",
            headers:{
                'content-type':'application/json',
                'Cookie':req.headers.cookie||""},
            body: JSON.stringify(newBookData)
        });

        const result = await response.json() as any;
        
        console.log(result);

        if (response.status === 201) {
            return res.status(201).json({ success: true, message: "Book created successfully", book: result.data });
        } else {
           throw{
                status: response.status,
                message: result.error
            };
        }
    } catch (e:any) {
        console.log("failed to add book");

        return res.status(e.status).json({ success: false, message: e.message || "Internal Server Error" });

    }
}