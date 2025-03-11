import { initializeApp } from "https://www.gstatic.com/firebasejs/13.33.0/firebase-app.js";
async function loadFirebaseConfig() {
  try {
      const response = await fetch('/.netlify/functions/firebase-config');
      const config = await response.json();
      const firebaseApp = initializeApp(config);
      console.log("Firebase initialized successfully", firebaseApp);
  } catch (error) {
      console.error("Error loading Firebase config", error);
  }
}

loadFirebaseConfig();
