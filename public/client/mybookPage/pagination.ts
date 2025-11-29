const switchMyBookPage = (nextItem: HTMLLIElement) => {
	const nextPageNumber: number = parseInt(nextItem.dataset.pageIndex as string);
	const currentActiveItem = document.querySelector(
		".mybook-page-item.active",
	) as HTMLLIElement;
	const currentActivePage: number = currentActiveItem
		? parseInt(currentActiveItem.dataset.pageIndex as string)
		: 0;

	if (currentActivePage === nextPageNumber) {
		return;
	}

	window.location.href = `/page/content?state=mybooks&current=${nextPageNumber}`;
};

const myBookPrev = () => {
	const currentItem = document.querySelector(
		".mybook-page-item.active",
	) as HTMLLIElement;
	const currentPage: number = currentItem
		? parseInt(currentItem.dataset.pageIndex as string)
		: 0;
	if (currentPage === 1) {
		return;
	}
	const nextPageNumber = currentPage - 1;
	window.location.href = `/page/content?state=mybooks&current=${nextPageNumber}`;
};

const myBookNext = (totalPage: number) => {
	const currentItem = document.querySelector(
		".mybook-page-item.active",
	) as HTMLLIElement;
	const currentPage: number = currentItem
		? parseInt(currentItem.dataset.pageIndex as string)
		: 0;
	if (currentPage === totalPage) {
		return;
	}
	const nextPageNumber = currentPage + 1;
	window.location.href = `/page/content?state=mybooks&current=${nextPageNumber}`;
};

document.addEventListener("DOMContentLoaded", () => {
	try {
		const myBookListEl = document.querySelector(
			".mybook-pagination",
		) as HTMLUListElement | null;
		const myBookPageItemEl =
			document.querySelectorAll<HTMLLIElement>(".mybook-page-item");
		const mybookPreviousEl = document.querySelector(
			".mybook-page-item-previous",
		) as HTMLLIElement | null;
		const mybookNextEl = document.querySelector(
			".mybook-page-item-next",
		) as HTMLLIElement | null;

		if (!myBookListEl) {
			throw new Error("Pagination container not found.");
		}

		const totalPage: number = parseInt(
			myBookListEl.dataset.totalPage as string,
		);

		if (totalPage > 0) {
			if (!mybookPreviousEl || !mybookNextEl) {
				throw new Error("Previous/Next buttons missing.");
			}

			myBookPageItemEl.forEach((item) => {
				item.addEventListener("click", () => {
					switchMyBookPage(item);
				});
			});

			mybookPreviousEl.addEventListener("click", () => {
				myBookPrev();
			});

			mybookNextEl.addEventListener("click", () => {
				myBookNext(totalPage);
			});
		}
	} catch (e: unknown) {
		if (e instanceof Error) {
			console.error(`Initialization Error: ${e.message}`);
		} else {
			console.error("Something went wrong when initializing menu pagination");
		}
	}
});
