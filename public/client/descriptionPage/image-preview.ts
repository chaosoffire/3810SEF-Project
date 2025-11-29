document.addEventListener("DOMContentLoaded", (): void => {
	const bookCoverUpload = document.getElementById(
		"book-cover-upload",
	) as HTMLInputElement | null;
	const bookCover = document.getElementById(
		"book-cover",
	) as HTMLImageElement | null;

	const previous = document.getElementById(
		"previous-img",
	) as HTMLInputElement | null;

	if (bookCoverUpload && bookCover && previous) {
		bookCoverUpload.addEventListener("change", (event: Event): void => {
			bookCover.hidden = false;
			const target = event.target as HTMLInputElement;
			const file = target.files?.[0];

			if (file) {
				const reader = new FileReader();
				reader.onload = (e: ProgressEvent<FileReader>): void => {
					if (e.target && typeof e.target.result === "string") {
						bookCover.src = e.target.result;
						previous.value = e.target.result.split(",")[1];
					}
				};
				reader.readAsDataURL(file);
			} else {
				bookCover.hidden = true;
			}
		});
	}
});
