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
        let isGoogleRedirecting = true; // Empezamos asumiendo que Google está trabajando

        // Persistencia para que el móvil no olvide al usuario
        setPersistence(auth, browserLocalPersistence).catch(console.error);

        const handleAuth = async (firebaseUser) => {
            if (unsubscribeDoc) unsubscribeDoc();

            if (firebaseUser) {
                const userRef = doc(db, 'users', firebaseUser.uid);
                setUser(firebaseUser);

                // Escucha activa de Firestore
                unsubscribeDoc = onSnapshot(userRef, (docSnap) => {
                    if (docSnap.exists()) {
                        setUserData(docSnap.data());
                    } else {
                        // Creación de perfil para usuarios de Google nuevos
                        const initData = {
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            accesoPremium: false,
                            heroProfile: { name: firebaseUser.displayName || 'Héroe', gender: 'boy', avatar: 1 },
                            createdAt: serverTimestamp()
                        };
                        setDoc(userRef, initData).catch(console.error);
                    }
                    if (!isGoogleRedirecting) setLoading(false);
                }, (error) => {
                    if (!isGoogleRedirecting) setLoading(false);
                });
            } else {
                // Solo permitimos quitar el loading si Google ya terminó su proceso
                if (!isGoogleRedirecting) {
                    setUser(null);
                    setUserData(null);
                    setLoading(false);
                }
            }
        };

        // Escuchar cambios de autenticación
        const unsubscribeAuth = onAuthStateChanged(auth, handleAuth);

        // MANEJO CRÍTICO DE REDIRECCIÓN (GOOGLE MÓVIL)
        getRedirectResult(auth)
            .then((result) => {
                isGoogleRedirecting = false;
                if (result?.user) {
                    handleAuth(result.user);
                } else if (!auth.currentUser) {
                    setLoading(false);
                } else {
                    // Si ya hay un usuario (por persistencia), quitamos carga
                    setLoading(false);
                }
            })
            .catch((error) => {
                console.error("Error en redirección Google:", error);
                isGoogleRedirecting = false;
                setLoading(false);
            });

        return () => {
            unsubscribeAuth();
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
