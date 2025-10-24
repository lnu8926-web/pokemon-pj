// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCskvJkXOKFoGavU8__DUelOtw8Bv9ziBY",
  authDomain: "pokemonproject-672a3.firebaseapp.com",
  projectId: "pokemonproject-672a3",
  storageBucket: "pokemonproject-672a3.firebasestorage.app",
  messagingSenderId: "1088796164839",
  appId: "1:1088796164839:web:c9c4412f65d10d71e15842",
  measurementId: "G-28FM4HJXLM",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
