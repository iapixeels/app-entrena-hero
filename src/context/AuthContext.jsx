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

        // Persistencia para que no pierda sesión en móviles al cambiar de pestaña
        setPersistence(auth, browserLocalPersistence).catch(console.error);

        const syncUser = async (firebaseUser) => {
            if (unsubscribeDoc) unsubscribeDoc();

            if (firebaseUser) {
                console.log("Sesión activa detectada para:", firebaseUser.email);
                const userRef = doc(db, 'users', firebaseUser.uid);
                setUser(firebaseUser);

                // Escuchamos el perfil de Firestore en tiempo real
                unsubscribeDoc = onSnapshot(userRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setUserData(data);
                        console.log("Datos de héroe sincronizados.");
                    } else {
                        console.log("Héroe nuevo, creando perfil...");
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
                    console.error("Error en Snapshot:", error);
                    setLoading(false);
                });
            } else {
                console.log("Sin sesión de héroe.");
                setUser(null);
                setUserData(null);
                setLoading(false);
            }
        };

        // Escuchar el resultado de redirección (Crucial para estabilidad móvil de Google)
        getRedirectResult(auth)
            .then((result) => {
                if (result?.user) {
                    console.log("Entrando desde Google Redirect...");
                    syncUser(result.user);
                } else {
                    // Escuchar estado normal (persistente)
                    onAuthStateChanged(auth, (firebaseUser) => {
                        syncUser(firebaseUser);
                    });
                }
            })
            .catch((error) => {
                console.error("Error Auth Redirect:", error);
                setLoading(false);
            });

        return () => {
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
