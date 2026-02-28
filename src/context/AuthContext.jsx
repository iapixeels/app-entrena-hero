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

        setPersistence(auth, browserLocalPersistence).catch(console.error);

        const handleAuthChange = (firebaseUser) => {
            if (unsubscribeDoc) {
                unsubscribeDoc();
                unsubscribeDoc = null;
            }

            if (firebaseUser) {
                // USAMOS 'users' POR ESTÁNDAR. ASEGÚRATE QUE LA REGLA EN FIREBASE DIGA 'users'
                const userRef = doc(db, 'users', firebaseUser.uid);
                setUser(firebaseUser);

                unsubscribeDoc = onSnapshot(userRef, (docSnap) => {
                    if (docSnap.exists()) {
                        setUserData(docSnap.data());
                    } else {
                        const initData = {
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            accesoPremium: false,
                            heroProfile: { name: firebaseUser.displayName || 'Héroe', gender: 'boy', avatar: 1 },
                            createdAt: serverTimestamp()
                        };
                        setDoc(userRef, initData).catch(err => {
                            console.error("Error al crear usuario:", err);
                            alert("ERROR CRÍTICO: No se puede crear tu perfil. Revisa las reglas de Firestore.");
                        });
                    }
                    setLoading(false);
                }, (error) => {
                    console.error("Firestore Error:", error);
                    // Si sale este mensaje, es que la regla de Firestore está mal escrita
                    alert("ERROR DE PERMISOS: Firestore ha bloqueado el acceso. Verifica que la regla sea para la colección 'users' (con 'e' y 's').");
                    setLoading(false);
                });
            } else {
                setUser(null);
                setUserData(null);
                setLoading(false);
            }
        };

        const unsubscribeAuth = onAuthStateChanged(auth, handleAuthChange);

        getRedirectResult(auth).catch((error) => {
            if (error.code !== 'auth/redirect-cancelled-by-user') {
                alert("Error de Google: " + error.message);
            }
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
