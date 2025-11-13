// container of 2 forms
var formConEl = document.querySelector(".formContainer") as HTMLElement | null;
// container of 2 switch panels
var switchConEl = document.querySelector(
    ".switchContainer",
) as HTMLElement | null;
// container of sign in form (default visible)
var signInEl = document.querySelector("#sign-in") as HTMLElement | null;
// container of sign up form
var signUpEl = document.querySelector("#sign-up") as HTMLElement | null;
// container of 2 swtich panels
var overlayContainerEl = document.querySelector(
    ".overlay-container",
) as HTMLElement | null;
// left switch panel
var overlayLeftEl = document.querySelector(
    ".overlayLeft",
) as HTMLElement | null;
// right switch panel (default visible)
var overlayRightEl = document.querySelector(
    ".overlayRight",
) as HTMLElement | null;

// buttons
var signInSwitchBtnEl = document.querySelector(
    "#sign-in-btn",
) as HTMLButtonElement | null;
var signUpSwitchBtnEl = document.querySelector(
    "#sign-up-btn",
) as HTMLButtonElement | null;

signInSwitchBtnEl?.addEventListener("click", alt);
signUpSwitchBtnEl?.addEventListener("click", alt);

export function alt(): void {
    formConEl?.classList.toggle("changed");
    switchConEl?.classList.toggle("changed");
    signInEl?.classList.toggle("changed");
    signUpEl?.classList.toggle("changed");
    overlayContainerEl?.classList.toggle("changed");
    overlayLeftEl?.classList.toggle("changed");
    overlayRightEl?.classList.toggle("changed");

    if (signInEl) {
        signInEl.style.pointerEvents = signInEl.classList.contains("changed")
            ? "none"
            : "auto";
    }
    if (signUpEl) {
        signUpEl.style.pointerEvents = signUpEl.classList.contains("changed")
            ? "auto"
            : "none";
    }

    if (overlayLeftEl) {
        overlayLeftEl.style.pointerEvents = overlayLeftEl.classList.contains("changed")
            ? "auto"
            : "none";
    }
    if (overlayRightEl) {
        overlayRightEl.style.pointerEvents = overlayRightEl.classList.contains("changed")
            ? "none"
            : "auto";
    }
}
