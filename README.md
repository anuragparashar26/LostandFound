# Lost and Found Web App

A simple Firebase-based Lost and Found platform where users can post and view lost/found items via an authentication-protected dashboard.

---

## Live Demo

> *Coming soon or deploy on platforms like Firebase Hosting, Vercel, or Netlify*

---

## Project Structure

```
lostandfound/
│
├── assets/                # Images and graphics
├── firebase/
│   └── firebase-config.js # Firebase config (user-provided)
├── js/
│   ├── auth.js            # Auth-related JavaScript
│   └── dashboard.js       # Dashboard logic
├── public/
│   ├── dash.css
│   ├── dashboard.html
│   ├── signin.css
│   ├── signin.html
│   └── style.css
├── .env                   # Environment variables (ignored)
├── .gitignore
└── index.html             # Entry point
```

---

## 🚀 Features

* **Authentication** (via Firebase)
* **Post Lost/Found items**
* **User Dashboard** — displays items by the logged-in user
* **Clean UI** with responsive design
* **Firebase Integration**

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/LostandFound.git
cd LostandFound
```

### 2. Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new Firebase project
3. Enable **Authentication > Sign-in method > Email/Password**
4. Go to **Project Settings > General > Web App** and register your app
5. Copy the config object and replace it in:

   ```
   firebase/firebase-config.js
   ```

   ```js
   // Example structure
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT_ID.appspot.com",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

### 3. Serve Locally

You can use any live server extension or run:

```bash
npx live-server
```

Make sure your entry point is `index.html`.

---
