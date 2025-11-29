interface BookItem {
	id: string;
	cover: string;
	title: string;
	author: string;
	price: string;
}

window.onload = (): void => {
	let cart: BookItem[] = JSON.parse(localStorage.getItem("cart") || "[]");

	const cartContainer = document.getElementById(
		"cart-container",
	) as HTMLElement | null;
	if (!cartContainer) {
		console.error("Cart container not found.");
		return;
	}

	const totalItems: number = cart.length;

	if (totalItems > 0) {
		cartContainer.innerHTML = `
            <h1>Your Cart</h1>
            <h2 id="total"><span id="total-price">$0.00</span></h2>
            <form id="checkout-form" action="/checkout" method="POST">
                <button type="submit" id="checkout">Checkout</button>
            </form>
            <span id="price-label">Price</span>
            <div class="line"></div>
        `;

		let totalPrice: number = 0;

		cart.forEach((item: BookItem) => {
			const itemContainer = document.createElement("div");
			itemContainer.classList.add("item-container");

			const line = document.createElement("div");
			line.classList.add("line");

			const deleteButton = document.createElement("button");
			deleteButton.classList.add("delete-btn");
			deleteButton.setAttribute("item-id", item.id);

			itemContainer.innerHTML = `
                <img class="book-cover" src="${item.cover}" alt="Book Cover">
                <div class="info-container">
                    <h2 class="book-title">${item.title}</h2>
                    <span class="book-author">${item.author}</span>
                </div>
                <span class="item-price">${item.price}</span>
            `;
			deleteButton.innerHTML = '<img src="/img/delete_icon.png">';

			cartContainer.appendChild(itemContainer);
			cartContainer.appendChild(deleteButton);
			cartContainer.appendChild(line);

			totalPrice += parseFloat(item.price);
		});

		const totalPriceSpan = document.getElementById(
			"total-price",
		) as HTMLSpanElement | null;
		if (totalPriceSpan) {
			const totalItemsText = `Total (${totalItems} item${totalItems !== 1 ? "s" : ""}): `;
			totalPriceSpan.textContent = `${totalItemsText} $${totalPrice.toFixed(2)}`;
		}

		// Handle checkout
		const checkoutForm = document.getElementById(
			"checkout-form",
		) as HTMLFormElement | null;
		if (checkoutForm) {
			checkoutForm.addEventListener("submit", (event: Event): void => {
				event.preventDefault();
				const currentCart: BookItem[] = JSON.parse(
					localStorage.getItem("cart") || "[]",
				);

				if (currentCart.length === 0) {
					alert("Your cart is empty!");
					return;
				}

				const bookIds: string[] = currentCart.map((item) => item.id);

				fetch("/page/checkout", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						type: "buy",
						bookIds: bookIds,
					}),
					credentials: "include",
				})
					.then((response) => response.json())
					.then((data: { success: boolean; message?: string }) => {
						if (data.success) {
							localStorage.removeItem("cart");
							window.location.href = "/page/content/?state=ordersuccess";
						} else {
							alert("Error: " + data.message);
						}
					})
					.catch((error: any) => {
						console.error("Error:", error);
						alert("Something went wrong. Please try again.");
					});
			});
		}
	} else {
		cartContainer.innerHTML = `
            <h1>Your Cart</h1>
            <div class="line"></div>
            <div id="no-item-container">
                <img src="/img/cart_empty_icon.png">
                <h3>There is no item here</h3>
                <div id="btn-container">
                    <a href="/page/content/?state=home" id="shop-now-link">
                        <button id="shop-now">Shop Now</button>
                    </a>
                </div>
            </div>
        `;
	}

	// Delete an item from the cart
	const deleteButtons = document.querySelectorAll(".delete-btn");
	deleteButtons.forEach((button) => {
		button.addEventListener("click", function (this: HTMLButtonElement): void {
			const itemId = this.getAttribute("item-id");
			if (itemId) {
				cart = cart.filter((item) => item.id !== itemId);
				localStorage.setItem("cart", JSON.stringify(cart));
				window.location.reload();
			}
		});
	});
};
