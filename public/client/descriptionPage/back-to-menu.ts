document.addEventListener("DOMContentLoaded",()=>{
    const form = document.querySelector("#back-to-menu-form") as HTMLInputElement;

    form.addEventListener("submit", (event)=>{
        event.preventDefault();
        window.history.back()
    });
})