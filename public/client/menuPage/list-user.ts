// const listUserEl = document.querySelector(
//     "#list-user",
// ) as HTMLAnchorElement | null;


// listUserEl?.addEventListener("click", async(event) => {
//     const response:Response = await fetch("/page/users/",{
//         method:"GET",
//         credentials:"include"
//     })
    
//     if(response.ok){
//         const result:any = await response.json();
//         window.alert(result);
//     }else{
//         window.alert("Failed to get users");
//     }

// });