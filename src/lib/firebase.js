import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    // CONFIGURACIÓN DE FIREBASE
    // Por favor, completa estos datos con los de tu consola de Firebase
    apiKey: "AIzaSyCFs4YatRwCJJW_hdq479WxhaIxVCDTfDE",
    authDomain: "entrena-hero-f.firebaseapp.com",
    projectId: "entrena-hero-f",
    storageBucket: "entrena-hero-f.appspot.com",
    messagingSenderId: "872291883010",
    appId: "1:872291883010:web:db5c5df3d782c078426f1b"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
