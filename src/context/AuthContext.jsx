import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, getRedirectResult, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unsubscribeDoc = null;

        // Aseguramos la persistencia para que el móvil no pierda la sesión durante el salto a Google
        setPersistence(auth, browserLocalPersistence).catch(console.error);

        const handleAuthChange = (firebaseUser) => {
            // Si el estado cambia, limpiamos cualquier conexión previa
            if (unsubscribeDoc) {
                unsubscribeDoc();
                unsubscribeDoc = null;
            }

            if (firebaseUser) {
                const userRef = doc(db, 'users', firebaseUser.uid);
                setUser(firebaseUser);

                // IMPORTANTE: No marcamos loading como false hasta que Firestore responda
                unsubscribeDoc = onSnapshot(userRef, (docSnap) => {
                    if (docSnap.exists()) {
                        setUserData(docSnap.data());
                    } else {
                        // Crear documento si no existe (primer ingreso)
                        const initData = {
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            accesoPremium: false,
                            heroProfile: { name: firebaseUser.displayName || 'Héroe', gender: 'boy', avatar: 1 },
                            createdAt: serverTimestamp()
                        };
                        setDoc(userRef, initData).catch(console.error);
                    }
                    setLoading(false);
                }, (error) => {
                    console.error("Firestore Error:", error);
                    setLoading(false);
                });
            } else {
                setUser(null);
                setUserData(null);
                setLoading(false);
            }
        };

        const unsubscribeAuth = onAuthStateChanged(auth, handleAuthChange);

        // Capturar resultado de redirección de Google (Vital para móviles)
        getRedirectResult(auth).catch((error) => {
            console.error("Redirect Error:", error);
            setLoading(false);
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeDoc) unsubscribeDoc();
        };
    }, []);

    // Verificación de Premium Flexible
    const isPremium = userData?.accesoPremium === true ||
        String(userData?.accesoPremium).toLowerCase() === 'true' ||
        userData?.accesoPremium === 1;

    const value = {
        user,
        userData,
        isPremium,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
