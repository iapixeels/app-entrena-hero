import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, getRedirectResult, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unsubscribeDoc = null;
        let isRedirecting = true; // Forzamos estado de espera inicial

        // Aseguramos persistencia local para que no se pierda la sesión al recargar
        setPersistence(auth, browserLocalPersistence).catch(console.error);

        const handleUserData = (firebaseUser) => {
            if (unsubscribeDoc) unsubscribeDoc();

            if (firebaseUser) {
                const userRef = doc(db, 'users', firebaseUser.uid);
                setUser(firebaseUser);

                // Escucha de Firestore en tiempo real para datos Premium
                unsubscribeDoc = onSnapshot(userRef, (docSnap) => {
                    if (docSnap.exists()) {
                        setUserData(docSnap.data());
                    } else {
                        // Crear perfil para el nuevo Héroe de Google
                        const initData = {
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            accesoPremium: false,
                            heroProfile: { name: firebaseUser.displayName || 'Héroe', gender: 'boy', avatar: 1 },
                            createdAt: serverTimestamp()
                        };
                        setDoc(userRef, initData).catch(console.error);
                    }
                    if (!isRedirecting) setLoading(false);
                }, (error) => {
                    console.error("Firestore Error:", error);
                    if (!isRedirecting) setLoading(false);
                });
            } else {
                if (!isRedirecting) {
                    setUser(null);
                    setUserData(null);
                    setLoading(false);
                }
            }
        };

        // 1. Escuchar el estado de autenticación básico
        const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
            if (!isRedirecting) handleUserData(u);
        });

        // 2. Manejar el resultado de la redirección de Google (Móviles)
        getRedirectResult(auth)
            .then((result) => {
                isRedirecting = false;
                if (result?.user) {
                    handleUserData(result.user);
                } else {
                    // Si no venimos de un login de Google, evaluamos el usuario actual
                    handleUserData(auth.currentUser);
                }
            })
            .catch((error) => {
                console.error("Error en redirección:", error);
                isRedirecting = false;
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
