const loginURLParams:URLSearchParams = new URLSearchParams(window.location.search);

const signInStatusEl_r =  document.querySelector("#sign-in-status") as HTMLElement | null;
signInStatusEl_r!.style.color = "#8B0000";

if (loginURLParams.get('error') === '401'){
    signInStatusEl_r!.innerText = "ID or password incorrect";
    history.replaceState(null, '', window.location.pathname);
}else if(loginURLParams.get('error') === 'other'){
    signInStatusEl_r!.innerText = "Something went wrong please try again";
    signInStatusEl_r!.style.color = "#8B0000";
    history.replaceState(null, '', window.location.pathname);
}