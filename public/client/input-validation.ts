const signInBtnEl = document.querySelector("#sign-inBtn") as HTMLButtonElement | null;
const signUpBtnEl = document.querySelector("#sign-upBtn") as HTMLButtonElement | null;

const signInIDEl =  document.querySelector("#sign-in-id") as HTMLInputElement | null;
const signInPasswordEl =  document.querySelector("#sign-in-password") as HTMLInputElement | null;
const signUpIDEl =  document.querySelector("#sign-up-id") as HTMLInputElement | null;
const signUpPasswordEl =  document.querySelector("#sign-up-password") as HTMLInputElement | null;

const signUpStatusEl_v =  document.querySelector("#sign-up-status") as HTMLElement | null;
const signInStatusEl_v =  document.querySelector("#sign-in-status") as HTMLElement | null;

const signInFormEl = document.querySelector("#sign-in") as HTMLFormElement | null;
const signUpFormEl = document.querySelector("#sign-up") as HTMLFormElement | null;

signUpFormEl?.addEventListener("submit", (e:SubmitEvent) => {signUpValidation(e)});
signInFormEl?.addEventListener("submit", (e:SubmitEvent) => {signInValidation(e)});

function signInValidation(e:SubmitEvent): void{
    e.preventDefault();
    const id: String = signInIDEl!.value;
    const password: String = signInPasswordEl!.value;
    // check credential all typed in
    if(id.trim() === "" || password.trim() === ""){
        signInStatusEl_v!.innerText = "Please type in all the required credentials.";
        signInStatusEl_v!.style.color = "#8B0000";
        return;
    }
    signInFormEl!.submit();
}

function signUpValidation(e:SubmitEvent): void{
        e.preventDefault();
        const id: String = signUpIDEl!.value;
        const password: String = signUpPasswordEl!.value;
        // check credential all typed in
        if(id.trim() === "" || password.trim() === ""){
            signUpStatusEl_v!.innerText = "Please type in all the required credentials.";
            signUpStatusEl_v!.style.color = "#8B0000";
            return;
        }else if(password.trim().length < 8){
            signUpStatusEl_v!.innerText = "Please provide a password with at least 8 digits.";
            signUpStatusEl_v!.style.color = "#8B0000";
            return;
        }
    
    signUpFormEl!.submit();
}