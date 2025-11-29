function updatePageLinks(
	pageItemEl: NodeListOf<HTMLLIElement>,
	newStartPage: number,
	nextPageNumber: number,
	totalPage: number,
): void {
	let pageNumber: number = newStartPage;

	pageItemEl.forEach((item) => {
		if (pageNumber <= totalPage) {
			item.style.display = "block";
			item.innerText = pageNumber.toString();
			item.dataset.pageIndex = pageNumber.toString();
			item.classList.toggle("active", pageNumber === nextPageNumber);
		} else {
			item.style.display = "none";
		}
		pageNumber++;
	});
}

const switchMenuPage = async (
	listEl: HTMLUListElement,
	pageItemEl: NodeListOf<HTMLLIElement>,
	totalPage: number,
	nextItem: HTMLLIElement,
) => {
	const nextPageNumber: number = parseInt(nextItem.dataset.pageIndex as string);
	const currentActiveItem = document.querySelector(
		".home-page-item.active",
	) as HTMLLIElement | null;
	const currentActivePage: number = currentActiveItem
		? parseInt(currentActiveItem.dataset.pageIndex as string)
		: 0;

	if (nextPageNumber === currentActivePage) {
		return;
	}

	let newStartPage: number;
	if (totalPage <= 3) {
		newStartPage = 1;
	} else if (nextPageNumber <= 2) {
		newStartPage = 1;
	} else if (nextPageNumber >= totalPage - 1) {
		newStartPage = Math.max(1, totalPage - 2);
	} else {
		newStartPage = nextPageNumber - 1;
	}

	const newEndPage: number = Math.min(totalPage, newStartPage + 2);

	listEl.dataset.startPage = newStartPage.toString();
	listEl.dataset.endPage = newEndPage.toString();

	updatePageLinks(pageItemEl, newStartPage, nextPageNumber, totalPage);

	const offset: number = (nextPageNumber - 1) * 10;
	const hiddenInput = document.querySelector(
		"#base-book-query",
	) as HTMLInputElement | null;

	if (hiddenInput) {
		const query = hiddenInput.value as string;

		const patternForOffsets: RegExp = /\|start\.\d+/g;
		let cleanQuery: string = query.replace(patternForOffsets, "");

		cleanQuery += `|start.${offset}`;

		console.log(
			`Navigating to page ${nextPageNumber} with query: ${cleanQuery}`,
		);

		window.location.href = `/page/content?state=home&requestQuery=${cleanQuery}`;
	} else {
		console.error(
			"CRITICAL ERROR: Hidden base-book-query input not found. Cannot navigate.",
		);
	}
};

const prev = async (
	listEl: HTMLUListElement,
	pageItemEl: NodeListOf<HTMLLIElement>,
	totalPage: number,
) => {
	const currentItem = document.querySelector(
		".home-page-item.active",
	) as HTMLLIElement | null;
	if (!currentItem) return;

	const currentPageNumber: number = parseInt(
		currentItem.dataset.pageIndex as string,
	);

	if (currentPageNumber === 1) return;

	try {
		const nextPageNumber: number = currentPageNumber - 1;
		const targetItem: HTMLLIElement = pageItemEl[0];
		targetItem.dataset.pageIndex = nextPageNumber.toString();

		switchMenuPage(listEl, pageItemEl, totalPage, targetItem);
	} catch (e: unknown) {
		if (e instanceof Error) console.error(e.message);
		else console.error("Something went wrong when loading previous page");
	}
};

const next = async (
	listEl: HTMLUListElement,
	pageItemEl: NodeListOf<HTMLLIElement>,
	totalPage: number,
) => {
	const currentItem = document.querySelector(
		".home-page-item.active",
	) as HTMLLIElement | null;
	if (!currentItem) return;

	const currentPageNumber: number = parseInt(
		currentItem.dataset.pageIndex as string,
	);

	if (currentPageNumber === totalPage) return;

	try {
		const nextPageNumber: number = currentPageNumber + 1;
		const targetItem: HTMLLIElement = pageItemEl[pageItemEl.length - 1];
		targetItem.dataset.pageIndex = nextPageNumber.toString();

		switchMenuPage(listEl, pageItemEl, totalPage, targetItem);
	} catch (e: unknown) {
		if (e instanceof Error) console.error(e.message);
		else console.error("Something went wrong when loading next page");
	}
};

document.addEventListener("DOMContentLoaded", () => {
	try {
		const listEl = document.querySelector(
			".home-pagination",
		) as HTMLUListElement | null;
		const pageItemEl =
			document.querySelectorAll<HTMLLIElement>(".home-page-item");
		const previousEl = document.querySelector(
			".home-page-item-previous",
		) as HTMLLIElement | null;
		const nextEl = document.querySelector(
			".home-page-item-next",
		) as HTMLLIElement | null;

		if (!listEl) throw new Error("Pagination container not found.");

		const totalPage: number = parseInt(
			(listEl.dataset.totalPage as string) || "0",
		);

		// Only attach listeners if total pages > 1
		if (totalPage > 1) {
			if (!previousEl || !nextEl)
				throw new Error("Previous/Next buttons missing.");

			pageItemEl.forEach((item) => {
				item.addEventListener("click", () => {
					switchMenuPage(listEl, pageItemEl, totalPage, item);
				});
			});

			previousEl.addEventListener("click", () => {
				prev(listEl, pageItemEl, totalPage);
			});

			nextEl.addEventListener("click", () => {
				next(listEl, pageItemEl, totalPage);
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
