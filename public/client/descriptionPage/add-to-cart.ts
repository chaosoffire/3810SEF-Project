import type * as interfaces from "../../frontend/Interface/interface";

interface BookItem {
	id: string;
	cover: string;
	title: string;
	author: string;
	price: string;
}

const addBtn = document.getElementById("add-btn") as HTMLButtonElement | null;
const cover = document.getElementById("book-cover") as HTMLImageElement | null;
const title = document.getElementById("title") as HTMLElement | null;
const author = document.getElementById("author") as HTMLElement | null;
const price = document.getElementById("price") as HTMLElement | null;

let isInCart: boolean;
let cart: BookItem[];
let bookItem: BookItem | undefined;
let owned: boolean = false;

window.onload = async () => {
	if (!addBtn || !cover || !title || !author || !price) {
		console.error("One or more required DOM elements not found.");
		return;
	}

	// call api to check of book owned

	const bookId = addBtn.getAttribute("currentBook-id");
	const bookCover = cover.getAttribute("src");
	const bookTitle = title.innerText;
	const bookAuthor = author.innerText;
	const bookPrice = price.innerText;

	if (!bookId || !bookCover) {
		console.error("Missing book ID or cover attribute.");
		return;
	}

	const response: Response = await fetch(`/page/ownedbook`, {
		method: "GET",
	});

	if (response.ok) {
		const result: interfaces.ownBookResult = await response.json();
		if (result.books.includes(bookId)) {
			owned = true;
		}
	}

	bookItem = {
		id: bookId,
		cover: bookCover,
		title: bookTitle,
		author: bookAuthor,
		price: bookPrice,
	};

	cart = JSON.parse(localStorage.getItem("cart") || "[]") as BookItem[];
	isInCart = cart.some(
		(item: BookItem) => item.id === (bookItem as BookItem).id,
	);

	if (owned) {
		if (addBtn.classList.contains("disabled")) {
			addBtn.classList.remove("disabled");
		}
		addBtn.innerText = "Read Book";
	} else if (isInCart) {
		if (!addBtn.classList.contains("disabled")) {
			addBtn.classList.add("disabled");
			addBtn.innerText = "Already In Cart";
		}
	} else {
		if (addBtn.classList.contains("disabled")) {
			addBtn.classList.remove("disabled");
			addBtn.innerText = "Add to Cart";
		}
	}

	if (addBtn && owned) {
		addBtn.onclick = (): void => {
			const bookTitle = title?.innerText as string;
			const url: string = `${window.location.origin}/page/bookcontent?title=${bookTitle}`;
			window.open(url, "_blank");
		};
	}

	if (addBtn && !owned) {
		addBtn.onclick = (): void => {
			if (!bookItem) {
				console.error("Book item not initialized.");
				return;
			}

			cart = JSON.parse(localStorage.getItem("cart") || "[]") as BookItem[];
			isInCart = cart.some((item: BookItem) => item.id === bookItem?.id);

			if (isInCart) {
				alert("This book is already in your cart.");
			} else {
				cart.push(bookItem);
				localStorage.setItem("cart", JSON.stringify(cart));
				window.showPopup();

				if (!addBtn.classList.contains("disabled")) {
					addBtn.classList.add("disabled");
					addBtn.innerText = "Already In Cart";
				}
			}
		};
	}
};
