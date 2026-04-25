// Import the functions you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";   // ✅ ADD THIS

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyD1ri71OQhnHdFU2FaxkPlvhmR3ID1VFRA",
  authDomain: "ecommerce-9add7.firebaseapp.com",
  projectId: "ecommerce-9add7",
  storageBucket: "ecommerce-9add7.firebasestorage.app",
  messagingSenderId: "933625501646",
  appId: "1:933625501646:web:a110d8cbd32868a9f0bd9f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ ADD THIS LINE (MOST IMPORTANT)
export const auth = getAuth(app);