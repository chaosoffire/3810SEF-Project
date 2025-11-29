document.addEventListener("DOMContentLoaded", () => {
	const bookListItems = document.querySelectorAll<HTMLLIElement>(".mybook");

	bookListItems.forEach((bookItem) => {
		const readBtn = bookItem.querySelector(
			".mybook-read-btn",
		) as HTMLInputElement | null;
		const refundBtn = bookItem.querySelector(
			".mybook-refund-btn",
		) as HTMLInputElement | null;
		if (readBtn) {
			readBtn.addEventListener("click", (event) => {
				const titleEl = bookItem.querySelector(".mybook-title") as HTMLElement;
				if (titleEl) {
					const url: string = `${window.location.origin}/page/bookcontent?title=${titleEl.innerText}`;
					window.open(url, "_blank");
				}
			});
		}

		if (refundBtn) {
			refundBtn.addEventListener("click", async (event) => {
				const id = bookItem.dataset.id as string;
				const response: Response = await fetch("/page/checkout", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						type: "refund",
						bookIds: [id],
					}),
					credentials: "include",
				});

				if (response.ok) {
					window.alert("refund success");
					window.location.reload();
				} else {
					window.alert("refund failed");
				}
			});
		}
	});
});
