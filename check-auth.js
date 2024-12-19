import { app } from './config.js'; 
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";

const auth = getAuth(app);


onAuthStateChanged(auth, (user) => {
  if (!user) {
   
    window.location.href = "signin.html";
  } else {
    
    console.log("User is signed in:", user.email);
  }
});
