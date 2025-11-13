const _signInBtnEl = document.querySelector(
    "#sign-inBtn",
) as HTMLButtonElement | null;
const _signUpBtnEl = document.querySelector(
    "#sign-upBtn",
) as HTMLButtonElement | null;

const signInIDEl = document.querySelector(
    "#sign-in-id",
) as HTMLInputElement | null;
const signInPasswordEl = document.querySelector(
    "#sign-in-password",
) as HTMLInputElement | null;
const signUpIDEl = document.querySelector(
    "#sign-up-id",
) as HTMLInputElement | null;
const signUpPasswordEl = document.querySelector(
    "#sign-up-password",
) as HTMLInputElement | null;

const signUpStatusEl_v = document.querySelector(
    "#sign-up-status",
) as HTMLElement | null;
const signInStatusEl_v = document.querySelector(
    "#sign-in-status",
) as HTMLElement | null;

const signInFormEl = document.querySelector(
    "#sign-in",
) as HTMLFormElement | null;
const signUpFormEl = document.querySelector(
    "#sign-up",
) as HTMLFormElement | null;

signUpFormEl?.addEventListener("submit", (e: SubmitEvent) => {
    signUpValidation(e);
});
signInFormEl?.addEventListener("submit", (e: SubmitEvent) => {
    signInValidation(e);
});

function signInValidation(e: SubmitEvent): void {
    e.preventDefault();
    const id: string = signInIDEl?.value.trim() ?? "";
    const password: string = signInPasswordEl?.value.trim() ?? "";
    // check credential all typed in
    if (id === "" || password === "") {
        signInStatusEl_v!.innerText =
            "Please type in all the required credentials.";
        if (signInStatusEl_v) {
            signInStatusEl_v.style.color = "#8B0000";
        }
        return;
    }

    signInIDEl!.value = id;
    signInPasswordEl!.value = password;

    signInFormEl?.submit();
}

function signUpValidation(e: SubmitEvent): void {
    e.preventDefault();
    const id: string = signUpIDEl?.value.trim() ?? "";
    const password: string = signUpPasswordEl?.value.trim() ?? "";
    // check credential all typed in
    if (signUpStatusEl_v) {
        signUpStatusEl_v.style.color = "#8B0000";
    }
    if (id === "" || password === "") {
        signUpStatusEl_v!.innerText =
            "Please type in all the required credentials.";
        return;
    } else if (id.length < 8 || id.length > 32) {
        signUpStatusEl_v!.innerText =
            "Please provide an id within length of 8 and 32.";
        return;
    } else if (!id.match(/^[A-Za-z][_A-Za-z0-9]{7,31}$/)) {
        signUpStatusEl_v!.innerText =
            "Username must starts with a letter, and contains only number, character and underscore";
        return;
    } else if (password.length < 12 || password.length > 64) {
        signUpStatusEl_v!.innerText =
            "Password length must be within 12 and 64.";
        return;
    } else if (
        !password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[A-Za-z0-9]{12,64}$/)
    ) {
        signUpStatusEl_v!.innerText =
            "Password must include an uppercase, lowercase, number";
        return;
    }
    signUpIDEl!.value = id;
    signUpPasswordEl!.value = password;
    signUpFormEl?.submit();
}
