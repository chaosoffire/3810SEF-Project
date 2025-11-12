document.addEventListener("DOMContentLoaded", (): void => {
    const bookCoverUpload = document.getElementById(
        "book-cover-upload",
    ) as HTMLInputElement | null;
    const bookCover = document.getElementById(
        "book-cover",
    ) as HTMLImageElement | null;

    if (bookCoverUpload && bookCover) {
        bookCoverUpload.addEventListener("change", (event: Event): void => {
            bookCover.hidden = false;
            const target = event.target as HTMLInputElement;
            const file = target.files?.[0];

            if (file) {
                const reader = new FileReader();
                reader.onload = (e: ProgressEvent<FileReader>): void => {
                    if (e.target && typeof e.target.result === "string") {
                        bookCover.src = e.target.result;
                    }
                };
                reader.readAsDataURL(file);
            } else {
                bookCover.hidden = true;
            }
        });
    }
});
