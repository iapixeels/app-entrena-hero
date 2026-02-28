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

        // Asegurar persistencia local (vital para móviles)
        setPersistence(auth, browserLocalPersistence).catch(console.error);

        const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
            // Si el estado cambia a "logueado", NO quitamos el loading hasta tener los datos de Firestore
            if (firebaseUser) {
                setUser(firebaseUser);
                const userRef = doc(db, 'users', firebaseUser.uid);

                // Escuchamos Firestore
                unsubscribeDoc = onSnapshot(userRef, (docSnap) => {
                    if (docSnap.exists()) {
                        setUserData(docSnap.data());
                    } else {
                        // Si el usuario es nuevo, creamos su perfil básico
                        const initData = {
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            accesoPremium: false,
                            heroProfile: { name: firebaseUser.displayName || 'Héroe', gender: 'boy', avatar: 1 },
                            createdAt: serverTimestamp()
                        };
                        setDoc(userRef, initData).catch(console.error);
                    }
                    // Solo aquí decimos que la carga terminó
                    setLoading(false);
                }, (err) => {
                    console.error("Error en Snapshot:", err);
                    setLoading(false);
                });
            } else {
                // Si no hay usuario, limpiamos todo y terminamos carga
                setUser(null);
                setUserData(null);
                setLoading(false);
            }
        });

        // Manejar el resultado del redirect de Google de forma silenciosa
        getRedirectResult(auth).catch(console.error);

        return () => {
            unsubscribeAuth();
            if (unsubscribeDoc) unsubscribeDoc();
        };
    }, []);

    const value = {
        user,
        userData,
        isPremium: userData?.accesoPremium === true,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
