const _saveBtnEl = document.querySelector(
    "#save-btn",
) as HTMLButtonElement | null;

// const form = document.querySelector("#add-form") as HTMLFormElement | null;

let form = document.querySelector("#update-form") as HTMLFormElement | null;

if (!form) {
    form = document.querySelector("#add-form") as HTMLFormElement | null;
}

if (form) {
    form.addEventListener(
        "submit",
        async (event: SubmitEvent): Promise<void> => {
            event.preventDefault();
            const formData = new FormData(form!);
            const url = form?.getAttribute("action");
            const method = form?.getAttribute("method");
            const isAdding = method?.toUpperCase() === "POST";

            if (!url || !method) {
                alert("Form action or method is missing.");
                return;
            }

            try {
                const response = await fetch(url, {
                    method: method,
                    body: formData,
                    credentials: "include",
                });

                const data: {
                    success: boolean;
                    message?: string;
                    book?: {
                        _id: string;
                        coverImage?: string;
                    };
                } = await response.json();
                console.log("after add", data);
                if (response.ok && data.success) {
                    const successMessage = isAdding
                        ? "Book created successfully!"
                        : "Book updated successfully!";
                    alert(successMessage);

                    if (isAdding && data.book) {
                        // Redirect to the book"s page
                        window.location.href = `/page/content/?state=home`;
                    } else if (!isAdding && data.book && data.book.coverImage) {
                        // Update the book cover image source for updates
                        const bookCoverElement = document.getElementById(
                            "book-cover",
                        ) as HTMLImageElement | null;
                        if (bookCoverElement) {
                            bookCoverElement.src = `data:image/jpeg;base64,${data.book.coverImage}`;
                        }
                    } else if (!isAdding) {
                        // For updates, reload to reflect other changes
                        window.location.reload();
                    }
                } else {
                    // Use a more specific error message if available
                    const message =
                        data.message ||
                        `Failed to ${isAdding ? "create" : "update"} the book`;
                    alert(`Error: ${message}`);
                }
            } catch (error: any) {
                console.error(
                    `Error ${isAdding ? "creating" : "updating"} the book:`,
                    error,
                );
                alert("Something went wrong. Please try again.");
            }
        },
    );
}

// Price input
const priceInput = document.getElementById("price") as HTMLInputElement | null;

if (priceInput) {
    priceInput.addEventListener("input", (e: Event): void => {
        const target = e.target as HTMLInputElement;
        const value: string = target.value;

        // Allow only digits and a single decimal point
        let sanitized: string = value.replace(/[^\d.]/g, "");

        // Ensure only one decimal point
        const firstDot = sanitized.indexOf(".");
        if (firstDot !== -1) {
            const afterDot = sanitized
                .substring(firstDot + 1)
                .replace(/\./g, "");
            sanitized = sanitized.substring(0, firstDot + 1) + afterDot;
        }

        // Limit to two decimal places
        const parts = sanitized.split(".");
        if (parts.length > 1 && parts[1].length > 2) {
            sanitized = `${parts[0]}.${parts[1].substring(0, 2)}`;
        }

        // Update input value
        if (target.value !== sanitized) {
            target.value = sanitized;
        }
    });

    priceInput.addEventListener("blur", (e: Event): void => {
        const target = e.target as HTMLInputElement;
        let value: string = target.value;

        if (value === "") {
            value = "0";
        }

        const numericValue = parseFloat(value);
        if (!Number.isNaN(numericValue)) {
            target.value = numericValue.toFixed(2);
        } else {
            // Fallback if it"s not a valid number after input
            target.value = "0.00";
        }
    });
}
