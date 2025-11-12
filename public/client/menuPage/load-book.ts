const searchFormEl = document.querySelector(
    "#search-form",
) as HTMLFormElement | null;
const _searchBtn = document.querySelector(
    "#search-btn",
) as HTMLButtonElement | null;
// const apiVersion = process.env.API_VERSION_NO as string|null;

// document.addEventListener("DOMContentLoaded",()=>{
//     const params:URLSearchParams = new URLSearchParams(window.location.search)
//     if(!params.get("bookData")){
//         searchBtn?.click();
//     }
// });

const priceFilterValue: Record<string, string> = {
    any: "",
    "0-5": "|minPrice.0|maxPrice.5",
    "5-10": "|minPrice.5|maxPrice.10",
    "10-15": "|minPrice.10|maxPrice.15",
    "15+": "|minPrice.15",
};

searchFormEl?.addEventListener("submit", async (e: SubmitEvent) => {
    e.preventDefault();

    const formData: FormData = new FormData(searchFormEl);

    const inputData: Record<string, FormDataEntryValue> = {};

    for (const [key, value] of formData.entries()) {
        inputData[key] = value;
    }
    const keyword: string = String(formData.get("keyword") || "");
    const keywordString: string =
        keyword === ""
            ? ""
            : `|title.${keyword}|author.${keyword}|description.${keyword}`;

    const priceRangestring: string =
        priceFilterValue[String(formData.get("price") || "any")];

    const sortBy: string = String(formData.get("sort") || "title");

    const category: string = String(formData.get("category") || "any");
    const categoryString: string =
        category === "any" ? "" : `|genres.${category}`;

    // set & to | and = to . to prevent query set them apart
    // set a frontend api to get book with completed url with query in req
    const query: string = `sortBy.${sortBy}${keywordString}${categoryString}${priceRangestring}|sortOrder.asc`;
    try {
        window.location.href = `/page/content?state=home&requestQuery=${query}`;
    } catch (e: any) {
        console.log(e.status);
    }
});
