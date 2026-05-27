// firebase-config.js — общий модуль, импортируется всеми страницами
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBLGr2hpmnmj1Mxf9072m8vQXJkLUN6YyY",
  authDomain: "antviz-515c8.firebaseapp.com",
  projectId: "antviz-515c8",
  storageBucket: "antviz-515c8.firebasestorage.app",
  messagingSenderId: "140073712504",
  appId: "1:140073712504:web:8a844268e38229cebde68d",
  measurementId: "G-7QHQ465XS3"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// ВАШ email — только для admin.html
export const ADMIN_EMAIL = "wbtipoofficialcom@gmail.com";
