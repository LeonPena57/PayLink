// firebase-config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAI2VfP6U8-_bTn1IglesX4XJMiXnhiRgM",
  authDomain: "paylink-ac73b.firebaseapp.com",
  projectId: "paylink-ac73b",
  storageBucket: "paylink-ac73b.appspot.com",
  messagingSenderId: "98294834275",
  appId: "1:98294834275:web:5e0587104999cb97d3c456",
  measurementId: "G-0CSCRNXLK5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Make Firebase services available globally
window.auth = auth;
window.db = db;
window.storage = storage;

// Notify other scripts that Firebase is ready
document.addEventListener('DOMContentLoaded', () => {
  const event = new CustomEvent('firebase-ready');
  document.dispatchEvent(event);
});