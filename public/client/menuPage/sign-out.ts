document.addEventListener("DOMContentLoaded", () => {
	const signOutForm = document.querySelector(
		"#sign-out-form",
	) as HTMLFormElement | null;

	if (signOutForm) {
		signOutForm.addEventListener("submit", (event) => {
			event.preventDefault();
			localStorage.removeItem("cart");
			signOutForm.submit();
		});
	}
});
