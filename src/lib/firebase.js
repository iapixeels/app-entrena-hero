import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyBtikiFAqpZmFTZnQUXtRzy7WlQMNVli00",
    authDomain: "app-final-entrena-hero.firebaseapp.com",
    projectId: "app-final-entrena-hero",
    storageBucket: "app-final-entrena-hero.firebasestorage.app",
    messagingSenderId: "1069470235003",
    appId: "1:1069470235003:web:13305e5ed832612d7625de",
    measurementId: "G-FFHVSHJ90J"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);

let analytics = null;
try {
    analytics = getAnalytics(app);
} catch (e) {
    console.warn("Analytics not supported or blocked:", e);
}

export { analytics };
export default app;
