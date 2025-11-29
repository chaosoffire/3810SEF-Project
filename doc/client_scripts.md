[Back](../README.md#-documentation-hub)
# Client-Side Scripts

This document details the TypeScript files located in `public/client/`. These scripts are compiled and served to the browser to handle UI interactions, form submissions, and API calls on specific pages.

## Login Page (`public/client/loginPage`)

- **`login-script.ts`**: Main entry point for the login page. Attaches event listeners to the login and signup forms.
- **`input-validation.ts`**: Provides real-time validation for username and password fields (length, complexity).
- **`login-respond.ts`**: Handles the `POST /api/v1/user/login` request and processes the response (redirects on success, shows error on failure).
- **`sign-up-respond.ts`**: Handles the `POST /api/v1/user/register` request.

## Menu Page (`public/client/menuPage`)

- **`load-book.ts`**: Fetches the list of books from `/api/v1/book` and renders them into the grid. Handles search filters.
- **`pagination.ts`**: Manages the pagination state (current page, items per page) and updates the UI accordingly.
- **`book-click.ts`**: Handles clicks on book cards, redirecting the user to the book description page.
- **`add-admin.ts`**: Logic for the "Add Admin" modal (admin-only).
- **`list-user.ts`**: (Disabled) Intended to fetch and display a list of users for admins, but the code is currently commented out.
- **`reset-password.ts`**: Handles the password reset flow.
- **`sign-out.ts`**: Handles the logout button click.

## Description Page (`public/client/descriptionPage`)

- **`add-to-cart.ts`**: Handles the "Add to Cart" button. Adds the book ID to the local storage cart.
- **`back-to-menu.ts`**: Simple navigation script to return to the main menu.
- **`edit-book.ts`**: Toggles the UI between "view" and "edit" modes (admin-only).
- **`update-book.ts`**: Sends `PUT /api/v1/book/:id` requests to save changes.
- **`image-preview.ts`**: Handles the file input for updating the book cover image.
- **`popup.ts`**: Utilities for showing success/error toast notifications.

## Cart Page (`public/client/cartPage`)

- **`cart.ts`**:
    - Loads cart items from local storage.
    - Fetches book details for each item.
    - Renders the cart table.
    - Calculates totals.
    - Handles "Checkout" (sends `POST /api/v1/user/orders`).

## My Books Page (`public/client/mybookPage`)

- **`mybook-operation.ts`**: Fetches the user's owned books via `/api/v1/user/ownbooks` and renders them.
- **`pagination.ts`**: Pagination logic specific to the "My Books" grid.
