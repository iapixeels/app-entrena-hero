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
        let authHandchecked = false;

        // Forzamos persistencia total
        setPersistence(auth, browserLocalPersistence).catch(console.error);

        const handleAuth = async (firebaseUser) => {
            if (unsubscribeDoc) unsubscribeDoc();

            if (firebaseUser) {
                const userRef = doc(db, 'users', firebaseUser.uid);
                setUser(firebaseUser);

                // Esperamos los datos de Firestore antes de liberar la pantalla
                unsubscribeDoc = onSnapshot(userRef, (docSnap) => {
                    if (docSnap.exists()) {
                        setUserData(docSnap.data());
                    } else {
                        // Crear perfil si es nuevo
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
                // Solo marcamos como no cargando si ya comprobamos que no hay redirección pendiente
                if (authHandchecked) {
                    setUser(null);
                    setUserData(null);
                    setLoading(false);
                }
            }
        };

        // Escuchar cambios de Auth
        const unsubscribeAuth = onAuthStateChanged(auth, handleAuth);

        // Bloqueo de seguridad para procesos de redirección (Móviles)
        getRedirectResult(auth).then((result) => {
            authHandchecked = true;
            if (result?.user) {
                handleAuth(result.user);
            } else if (!auth.currentUser) {
                setLoading(false);
            }
        }).catch((err) => {
            console.error("Redirect Error:", err);
            authHandchecked = true;
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
