import {bookResult} from "../../frontend/Interface/interface";

export const initLoad = async ():Promise<bookResult> => {
    const query = "sortBy.title|sortOrder.asc";

    const response: Response = await fetch(`/page/book?requestQuery=${query}`,{
        method:"GET"
    });

    const result:bookResult = await response.json();

    return result;
}