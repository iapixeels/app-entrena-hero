import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, getRedirectResult } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unsubscribeDoc = null;

        const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
            console.log("Estado de Auth cambiado:", firebaseUser ? "Usuario detectado" : "Sin usuario");

            // Limpiar listener anterior
            if (unsubscribeDoc) {
                unsubscribeDoc();
                unsubscribeDoc = null;
            }

            if (firebaseUser) {
                // PRIMERO: Establecer el usuario de Auth inmediatamente
                setUser(firebaseUser);

                const userRef = doc(db, 'users', firebaseUser.uid);

                // SEGUNDO: Escuchar los datos de Firestore
                unsubscribeDoc = onSnapshot(userRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        console.log("Datos de Firestore cargados:", data.heroProfile?.name);
                        setUserData(data);
                        setLoading(false);
                    } else {
                        console.log("El documento del usuario no existe, creándolo...");
                        // Creamos el documento si no existe
                        const newUserData = {
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            name: firebaseUser.displayName || 'Nuevo Héroe',
                            accesoPremium: false,
                            coins: 0,
                            streak: 0,
                            profilePhoto: firebaseUser.photoURL || null,
                            heroProfile: {
                                gender: 'boy',
                                avatar: 1,
                                name: firebaseUser.displayName || 'Héroe',
                            },
                            inventory: { xp: 0, level: 1, items: [] },
                            createdAt: serverTimestamp(),
                            lastUpdated: serverTimestamp()
                        };
                        setDoc(userRef, newUserData).catch(err => console.error("Error al crear usuario:", err));
                        // El snapshot volverá a dispararse tras el setDoc
                    }
                }, (error) => {
                    console.error("Error en Snapshot de Firestore:", error);
                    setLoading(false); // No bloquear la app si falla Firestore
                });
            } else {
                setUser(null);
                setUserData(null);
                setLoading(false);
            }
        });

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
