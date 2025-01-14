import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

export const firebaseConfig = {
  apiKey: "AIzaSyCfsSzgrrZJEWNJmfpkORZr-87npgiOTX4",
  authDomain: "lms-project-c30e0.firebaseapp.com",
  databaseURL: "https://lms-project-c30e0-default-rtdb.firebaseio.com",
  projectId: "lms-project-c30e0",
  storageBucket: "lms-project-c30e0.appspot.com",
  messagingSenderId: "312119585796",
  appId: "1:312119585796:web:2766a4c03cfd447484d951",
  measurementId: "G-9NPTTG0GEG",
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);

export const auth = getAuth(app);
export const database = getDatabase(app);
export const storage = getStorage(app);
