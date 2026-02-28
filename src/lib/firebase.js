import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Restauramos el dominio original autorizado por Google para evitar el Error 400
// pero mantenemos los IDs correctos de tu imagen.
const firebaseConfig = {
    apiKey: "AIzaSyBtikiFAqpZmFTZnQUXtRzy7WlQMNVli00",
    authDomain: "app-final-entrena-hero.firebaseapp.com", // Dominio oficial autorizado
    projectId: "app-final-entrena-hero",
    storageBucket: "app-final-entrena-hero.firebasestorage.app",
    messagingSenderId: "1069470235003",
    appId: "1:1069470235003:web:5f8db8f5c1c1377e7625de", // El ID correcto de tu imagen
    measurementId: "G-CD7JHWSS45" // El Measurement ID de tu imagen
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
    console.warn("Analytics blocked or not supported:", e);
}

export { analytics };
export default app;
