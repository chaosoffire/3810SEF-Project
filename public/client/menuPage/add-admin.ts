import type {
    signUpError,
    signUpPayload,
} from "../../frontend/Interface/interface";

const addAdminTagEl = document.querySelector(
    "#add-admin-tag",
) as HTMLAnchorElement | null;

addAdminTagEl?.addEventListener("click", async () => {
    let username: string | null;
    let password: string | null;
    while (true) {
        username = window.prompt("New Admin ID");
        password = window.prompt("New Admin password");
        if (username === null || password === null) {
            return;
        } else if (username === "" || password === "") {
            window.alert("please provide all the credentials");
        } else if (username.length < 8 || username.length > 32) {
            window.alert("Please provide an id within length of 8 and 32.");
        } else if (!username.match(/^[A-Za-z][_A-Za-z0-9]{7,31}$/)) {
            window.alert(
                "Username must starts with a letter, and contains only number, character and underscore",
            );
        } else if (password.length < 12 || password.length > 64) {
            window.alert("Password length must be within 12 and 64.");
        } else if (
            !password.match(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[A-Za-z0-9]{12,64}$/,
            )
        ) {
            window.alert(
                "Password must include an uppercase, lowercase, number",
            );
        } else {
            break;
        }
    }

    try {
        const payload: signUpPayload = {
            username: username,
            password: password,
            admin: true,
        };

        const response: Response = await fetch("/page/adminsignup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (response.status === 201) {
            window.alert("new admin account has been created!");
        } else {
            const result = (await response.json()) as signUpError;

            throw {
                status: response.status,
                error: result.error,
            };
        }
    } catch (e: any) {
        window.alert(`${e.error}code : ${e.status}`);
    }
});
