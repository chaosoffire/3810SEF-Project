import type * as interfaces from "../../frontend/Interface/interface";

document.addEventListener("DOMContentLoaded",()=>{
    const resetForm = document.querySelector("#reset-form") as HTMLFormElement | null;

    if(resetForm){
        resetForm.addEventListener("submit",async (event)=>{
            event.preventDefault();
            let currentPassword = window.prompt("Please input your current password") as string;
            while(currentPassword == ""){
                currentPassword = window.prompt("Please input your current password") as string;
            }
            let newPassword;
            while(true){
                newPassword = window.prompt("Please input your new password") as string;
                if (newPassword.length < 12 || newPassword.length > 64) {
                    window.alert("New password length must be within 12 and 64.");
                } else if (!newPassword.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[A-Za-z0-9]{12,64}$/,)){
                    window.alert("New password must include an uppercase, lowercase, number");
                } else{
                    break;
                }
            }

            const response:Response = await fetch("/page/reset",{
                method:"PUT",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({
                    oldPassword:currentPassword,
                    newPassword:newPassword
                }),
                credentials:"include"
            })

            if(response.status == 200){
                window.alert("Reset successful");
            }else{
                const result:interfaces.resetPasswordError = await response.json();
                window.alert(`Reset failed: ${result.error}`);
            }
        });
    }

});