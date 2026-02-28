import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, getRedirectResult, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unsubscribeDoc = null;
        let isHandlingRedirect = true;

        // Persistencia para móviles
        setPersistence(auth, browserLocalPersistence).catch(console.error);

        const syncUser = (firebaseUser) => {
            if (unsubscribeDoc) {
                unsubscribeDoc();
                unsubscribeDoc = null;
            }

            if (firebaseUser) {
                const userRef = doc(db, 'users', firebaseUser.uid);
                setUser(firebaseUser);

                unsubscribeDoc = onSnapshot(userRef, (docSnap) => {
                    if (docSnap.exists()) {
                        setUserData(docSnap.data());
                    } else {
                        // Crear perfil para el nuevo héroe
                        const initData = {
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            accesoPremium: false,
                            heroProfile: { name: firebaseUser.displayName || 'Héroe', gender: 'boy', avatar: 1 },
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
                setUser(null);
                setUserData(null);
                if (!isHandlingRedirect) setLoading(false);
            }
        };

        // Procesar resultado de Google (especialmente para móviles)
        getRedirectResult(auth)
            .then((result) => {
                isHandlingRedirect = false;
                if (result?.user) {
                    syncUser(result.user);
                } else {
                    // Si no venimos de un redirect, evaluamos el usuario actual
                    syncUser(auth.currentUser);
                }
            })
            .catch((error) => {
                console.error("Redirect Error:", error);
                isHandlingRedirect = false;
                setLoading(false);
            });

        // Este listener escucha siempre (incluyendo el Logout)
        const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
            // Solo procesamos aquí si ya terminó el chequeo inicial de Google
            if (!isHandlingRedirect) {
                syncUser(u);
            }
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeDoc) unsubscribeDoc();
        };
    }, []);

    const isPremium = userData?.accesoPremium === true ||
        String(userData?.accesoPremium).toLowerCase() === 'true' ||
        userData?.accesoPremium === 1;

    const logout = async () => {
        try {
            await auth.signOut();
            // Recargamos para limpiar cualquier residuo de Google en el móvil
            window.location.href = '/login';
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, userData, isPremium, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
