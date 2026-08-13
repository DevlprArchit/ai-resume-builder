import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCq1zFsKRUVDOCdsB1uaW0hRiYaWd-zw_o",
  authDomain: "airesume-75ee5.firebaseapp.com",
  projectId: "airesume-75ee5",
  storageBucket: "airesume-75ee5.firebasestorage.app",
  messagingSenderId: "982937004908",
  appId: "1:982937004908:web:82bb2070c1545b9e862149",
  measurementId: "G-E6YRJ1F0XH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export const storage = getStorage(app);
