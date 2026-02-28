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

        // Manejar resultado de redirección (importante para móviles)
        getRedirectResult(auth).catch((error) => {
            console.error("Error al procesar redirección de Google:", error);
        });

        const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
            // Limpiar listener previo si existe
            if (unsubscribeDoc) {
                unsubscribeDoc();
                unsubscribeDoc = null;
            }

            if (firebaseUser) {
                const userRef = doc(db, 'users', firebaseUser.uid);

                // Listener en tiempo real para progreso y stats
                unsubscribeDoc = onSnapshot(userRef, async (docSnap) => {
                    try {
                        if (docSnap.exists()) {
                            setUserData(docSnap.data());
                            setUser(firebaseUser);
                            setLoading(false);
                        } else {
                            console.log("Creando perfil nuevo en Firestore...");
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
                                heroData: {
                                    name: firebaseUser.displayName || 'Héroe',
                                    origin: 'titan'
                                },
                                inventory: {
                                    xp: 0,
                                    level: 1,
                                    items: [],
                                    lastUpdated: serverTimestamp()
                                },
                                equippedItems: {
                                    suit: null,
                                    cape: null,
                                    pet: null,
                                    aura: null
                                },
                                completedMissions: {
                                    strength: 0,
                                    speed: 0,
                                    flexibility: 0
                                },
                                rewards: {
                                    strength: { realReward: '', cyclesCompleted: 0, rewardDelivered: false },
                                    speed: { realReward: '', cyclesCompleted: 0, rewardDelivered: false },
                                    flexibility: { realReward: '', cyclesCompleted: 0, rewardDelivered: false }
                                },
                                createdAt: serverTimestamp(),
                                lastUpdated: serverTimestamp()
                            };
                            await setDoc(userRef, newUserData);
                            // El siguiente snapshot se encargará de poner loading en false
                        }
                    } catch (error) {
                        console.error("Error procesando datos de usuario:", error);
                        setLoading(false);
                    }
                }, (error) => {
                    console.error("Error en listener de Firestore:", error);
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
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
