# Funfire

## Current State
Admin panel uses Internet Identity (blockchain login) to authenticate. The admin page shows a "Login as Admin" button which triggers Internet Identity flow.

## Requested Changes (Diff)

### Add
- Username/password login screen on the Admin page
- Hardcoded credentials: username = "Pra2008", password = "PRAVEEN2008"
- Session state so once logged in, admin stays logged in during the session

### Modify
- Replace the Internet Identity login button on the admin page with a username/password form
- After successful login, show the existing admin panel (upload + manage posts)

### Remove
- Internet Identity login button from the admin access gate (the main login flow for admin)

## Implementation Plan
1. Add local state: `adminLoggedIn` (boolean), `usernameInput`, `passwordInput`, `loginError`
2. On form submit, check if username === "Pra2008" && password === "PRAVEEN2008"
3. If match: set `adminLoggedIn = true`, show admin panel
4. If no match: show error message "Invalid username or password"
5. Keep Internet Identity (`identity`) still required for actual backend calls (createPost, deletePost) — the username/password gate just controls UI access to the panel
6. Add a "Logout" button in the admin panel header to clear `adminLoggedIn`
