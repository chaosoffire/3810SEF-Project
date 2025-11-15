import type * as interfaces from "../../frontend/Interface/interface";

//validate session -> get data => pass role, -> validate session -> checkrole 
const bookClick = async(
    bookID:string,
) => {
    window.location.href = `/page/content?state=description&id=${bookID}`;
}


document.addEventListener('DOMContentLoaded',()=>{
    const container = document.querySelector("#book-list") as HTMLElement || null;
    if(container){
        container.addEventListener("click",(event)=>{
            if(event.target instanceof Element){
                const bookItem = event.target.closest(".book") as HTMLElement || null;
                if(bookItem){
                    const bookID = bookItem.getAttribute('data-book-id') as string;
                    if(bookID){
                        bookClick(bookID);
                    }
                }
            }
        });
    }
});