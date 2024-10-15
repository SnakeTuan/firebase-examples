// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBXt7VgaA993lE7QF5fZ9b0CpI3ds6bcMg",
  authDomain: "test-project-80867.firebaseapp.com",
  projectId: "test-project-80867",
  storageBucket: "test-project-80867.appspot.com",
  messagingSenderId: "72991868287",
  appId: "1:72991868287:web:bf8180a4428b365788464a",
  measurementId: "G-X8L6E9R60F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };
