import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, getRedirectResult, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState(null);

    useEffect(() => {
        let unsubscribeDoc = null;

        // Forzar persistencia local
        setPersistence(auth, browserLocalPersistence)
            .catch(err => console.error("Error de persistencia:", err));

        // Manejar resultado de redirección (Crucial para estabilidad en móviles)
        getRedirectResult(auth)
            .then((result) => {
                if (result?.user) {
                    console.log("Login por redirección exitoso:", result.user.email);
                }
            })
            .catch((error) => {
                console.error("Error en resultado de redirección:", error);
                setAuthError("Error de sincronización con Google.");
            });

        const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
            console.log("Firebase Auth State:", firebaseUser ? "Logueado" : "Desconectado");

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
                        console.log("Usuario detectado pero sin perfil en DB. Creando...");
                        // Creamos el documento si no existe
                        const newUserData = {
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            name: firebaseUser.displayName || 'Nuevo Héroe',
                            accesoPremium: false,
                            coins: 0,
                            streak: 0,
                            profilePhoto: firebaseUser.photoURL || null,
                            heroProfile: { gender: 'boy', name: firebaseUser.displayName || 'Héroe', avatar: 1 },
                            inventory: { xp: 0, level: 1, items: [] },
                            createdAt: serverTimestamp(),
                            lastUpdated: serverTimestamp()
                        };
                        setDoc(userRef, newUserData)
                            .then(() => console.log("Perfil base creado"))
                            .catch(err => {
                                console.error("Error creando perfil:", err);
                                setAuthError("Error al inicializar perfil.");
                                setLoading(false);
                            });
                    }
                }, (error) => {
                    console.error("Error en Snapshot:", error);
                    setAuthError("Error de conexión con la base de datos.");
                    setLoading(false);
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
        loading,
        authError
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
