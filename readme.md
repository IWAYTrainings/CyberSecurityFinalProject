# 🧪 InsecureBlogApp

A deliberately insecure blogging platform built with **Node.js**, **Express**, and **SQLite**. This app is designed to help students **identify**, **exploit**, and **fix** common web application vulnerabilities in a hands-on environment.

---

## 🚀 Features

- User Registration & Login (with poor session handling)
- Create and View Blog Posts
- Edit and Delete Own Posts
- Comment on Posts
- View All Posts
- No Role-based Access Control

---

## ⚔️ Assignment / Challenge Format

### 🔧 Setup Instructions

1. **Clone the repository**:

    ```bash
    git clone https://github.com/yourusername/InsecureBlogApp.git
    cd InsecureBlogApp
    ```

2. **Install dependencies**:

    ```bash
    npm install
    ```

3. **Run the application**:

    ```bash
    node app.js
    ```

4. Visit `http://localhost:3000` in your browser.

---

## 🔓 Vulnerabilities to Discover & Exploit

Below are the built-in vulnerabilities. Your task is to **find them**, **exploit them**, and then **secure the code**.

---

### 1. 🧼 Stored XSS

- Add `<script>alert('XSS')</script>` in the **blog content** or **comments**.
- View the post again. You’ll notice the alert does **not** trigger unless EJS is rendering unsanitized input.
- 🔍 Check `views/viewpost.ejs`.

> 💡 Hint to Fix: Use `<%- %>` for rendering unescaped content. To fix XSS, escape user input or use `<%= %>`.

---

### 2. 🔁 Reflected XSS

- Perform a **search** or trigger an error that includes your input in the response.
- Example: `http://localhost:3000/?search=<script>alert('xss')</script>`
- 🔍 Check `index.ejs` or error-handling responses in `app.js`.

> 💡 Hint to Fix: Use proper encoding for reflected data in responses.

---

### 3. 🛢 SQL Injection

- Try entering this in login or comment fields:

    ```sql
    ' OR '1'='1
    ```

- 🔍 Check `db.js` and any raw SQL query usage.

> 💡 Hint to Fix: Use **parameterized queries** with SQLite’s `?` placeholders.

---

### 4. 🆔 IDOR (Insecure Direct Object Reference)

- Login as one user, then manually try to **edit or delete another user's post** by modifying the `post_id` in the URL:

    ```
    http://localhost:3000/edit/2
    http://localhost:3000/delete/3
    ```

- 🔍 Check route handlers for `/edit/:id` and `/delete/:id`.

> 💡 Hint to Fix: Enforce ownership checks on post actions.

---

### 5. 🧯 No Input Validation

- Try injecting HTML/JS, SQL payloads, or invalid characters in any form field.
- Inputs are blindly accepted.

> 💡 Hint to Fix: Validate & sanitize user input using libraries like `validator.js` or express middleware.

---

### 6. 📢 Error Leakage

- Trigger intentional errors (invalid routes, malformed input).
- Stack traces or sensitive messages are visible.

> 💡 Hint to Fix: Use production-safe error handlers and avoid exposing stack traces.

---

### 7. 🔐 Plain Text Passwords

- Register a new user, then check the `users` table in `blog.db`.
- Passwords are saved in **plain text**.

> 💡 Hint to Fix: Use **bcrypt** to hash passwords before saving.

---

## 🧠 Bonus Challenges

- Add CSRF protection using tokens.
- Implement role-based access control (e.g., admin vs. user).
- Prevent session fixation and improve session management.

---

## ✅ Your Final Task

Once you've discovered and exploited the vulnerabilities, your task is to:

- Secure each one by **modifying the codebase**.
- Keep track of what changes you made and why.
- Submit your secure version for review.

Happy Hacking 🔓➡🔒!