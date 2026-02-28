import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, getRedirectResult, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, onSnapshot, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unsubscribeDoc = null;
        let isMounting = true;

        // Persistencia para que el móvil no olvide la sesión
        setPersistence(auth, browserLocalPersistence).catch(console.error);

        const syncProfile = (firebaseUser) => {
            if (unsubscribeDoc) unsubscribeDoc();

            if (firebaseUser) {
                const userRef = doc(db, 'users', firebaseUser.uid);
                setUser(firebaseUser);

                unsubscribeDoc = onSnapshot(userRef, (docSnap) => {
                    if (docSnap.exists()) {
                        setUserData(docSnap.data());
                    } else {
                        // Creación silenciosa del perfil
                        const initData = {
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            accesoPremium: false,
                            heroProfile: { name: firebaseUser.displayName || 'Héroe', gender: 'boy', avatar: 1 },
                            createdAt: serverTimestamp()
                        };
                        setDoc(userRef, initData).catch(console.error);
                    }
                    if (isMounting) setLoading(false);
                }, (err) => {
                    console.error("Firestore Error:", err);
                    setLoading(false);
                });
            } else {
                setUser(null);
                setUserData(null);
                setLoading(false);
            }
        };

        // GESTIÓN DE REDIRECCIÓN (VITAL PARA MÓVILES)
        const checkAuth = async () => {
            try {
                // Primero esperamos a ver si venimos de Google
                const result = await getRedirectResult(auth);
                if (result?.user) {
                    syncProfile(result.user);
                } else {
                    // Si no es un regreso de Google, escuchamos el estado persistente
                    onAuthStateChanged(auth, (u) => {
                        syncProfile(u);
                    });
                }
            } catch (error) {
                console.error("Auth Error:", error);
                setLoading(false);
            }
        };

        checkAuth();

        return () => {
            isMounting = false;
            if (unsubscribeDoc) unsubscribeDoc();
        };
    }, []);

    const isPremium = userData?.accesoPremium === true ||
        String(userData?.accesoPremium).toLowerCase() === 'true' ||
        userData?.accesoPremium === 1;

    return (
        <AuthContext.Provider value={{ user, userData, isPremium, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
