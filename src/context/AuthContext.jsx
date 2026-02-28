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
        let isHandlingRedirect = true; // Empezamos asumiendo que Google está procesando

        setPersistence(auth, browserLocalPersistence).catch(console.error);

        const syncUser = (firebaseUser) => {
            if (unsubscribeDoc) unsubscribeDoc();

            if (firebaseUser) {
                const userRef = doc(db, 'users', firebaseUser.uid);
                setUser(firebaseUser);

                unsubscribeDoc = onSnapshot(userRef, (docSnap) => {
                    if (docSnap.exists()) {
                        setUserData(docSnap.data());
                    } else {
                        // Creación inmediata para evitar rebotes a 'register'
                        const initData = {
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            accesoPremium: false,
                            heroProfile: {
                                name: firebaseUser.displayName || 'Héroe',
                                gender: 'boy',
                                avatar: 1
                            },
                            createdAt: serverTimestamp()
                        };
                        setDoc(userRef, initData).catch(console.error);
                    }
                    if (!isHandlingRedirect) setLoading(false);
                }, (error) => {
                    console.error("Firestore Error:", error);
                    setLoading(false);
                });
            } else {
                if (!isHandlingRedirect) {
                    setUser(null);
                    setUserData(null);
                    setLoading(false);
                }
            }
        };

        // 1. Escuchar cambios de Auth normales
        const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
            if (!isHandlingRedirect) syncUser(u);
        });

        // 2. Resolver Redirect de Google (VITAL PARA MÓVILES)
        getRedirectResult(auth)
            .then((result) => {
                isHandlingRedirect = false;
                if (result?.user) {
                    syncUser(result.user);
                } else {
                    syncUser(auth.currentUser);
                }
            })
            .catch((err) => {
                console.error("Redirect Error:", err);
                isHandlingRedirect = false;
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
