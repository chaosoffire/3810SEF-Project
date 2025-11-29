const signUpURLParams: URLSearchParams = new URLSearchParams(
	window.location.search,
);
// const signInStatusEl_r = document.querySelector("#sign-in-status") as HTMLElement||null;
// const signUpStatusEl_r = document.querySelector("#sign-up-status") as HTMLElement||null;

if (signUpURLParams.get("signUpSuccess") === "true") {
	window.alert("Sign up success! You can log in now!");
	history.replaceState(null, "", window.location.pathname);
} else if (signUpURLParams.get("signUpSuccess") === "false") {
	const message: string = `${signUpURLParams.get("message")}`;
	window.alert(message);
	history.replaceState(null, "", window.location.pathname);
}
