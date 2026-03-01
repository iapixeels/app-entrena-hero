import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, getRedirectResult, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { doc, onSnapshot, setDoc, updateDoc, getDoc, serverTimestamp, runTransaction } from 'firebase/firestore';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unsubscribeDoc = null;
        setPersistence(auth, browserLocalPersistence).catch(console.error);

        const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
            if (unsubscribeDoc) {
                unsubscribeDoc();
                unsubscribeDoc = null;
            }

            if (firebaseUser) {
                setUser(firebaseUser);
                const userRef = doc(db, 'users', firebaseUser.uid);

                unsubscribeDoc = onSnapshot(userRef, (docSnap) => {
                    if (docSnap.exists()) {
                        setUserData(docSnap.data());
                    } else {
                        const initData = {
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            provider: firebaseUser.providerData[0]?.providerId === 'google.com' ? 'google' : 'password',
                            accesoPremium: false,
                            heroProfile: {
                                name: firebaseUser.displayName || 'Héroe',
                                gender: 'boy',
                                avatar: 'boy' // Usamos el género como avatar por defecto
                            },
                            createdAt: serverTimestamp(),
                            inventory: { xp: 0, coins: 50, level: 1, items: [] },
                            completedMissions: { strength: 0, speed: 0, flexibility: 0 }
                        };
                        setDoc(userRef, initData).catch(console.error);
                    }
                    setLoading(false);
                }, (error) => {
                    console.error("Firestore Error:", error);
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

    // FUNCIÓN CRÍTICA: ACTIVACIÓN DE LICENCIA (Transaccional para mayor seguridad)
    const activateLicense = async (licenseCode) => {
        if (!user) throw new Error("Debes iniciar sesión para activar una licencia.");

        const cleanCode = licenseCode.trim().toUpperCase();
        const licenseRef = doc(db, 'licenses', cleanCode);
        const userRef = doc(db, 'users', user.uid);

        try {
            return await runTransaction(db, async (transaction) => {
                const licenseSnap = await transaction.get(licenseRef);

                // 1. Verificar existencia
                if (!licenseSnap.exists()) {
                    throw "Código inválido";
                }

                const licenseData = licenseSnap.data();

                // 2. Verificar si ya fue usada
                if (licenseData.used) {
                    throw "Este código ya fue utilizado";
                }

                // 3. Aplicar cambios simultáneos
                transaction.update(licenseRef, {
                    used: true,
                    usedBy: user.email,
                    usedAt: serverTimestamp()
                });

                transaction.update(userRef, {
                    accesoPremium: true
                });

                return true;
            });
        } catch (error) {
            console.error("Error en activación:", error);
            throw typeof error === 'string' ? error : "Error al procesar la licencia";
        }
    };

    const isPremium = userData?.accesoPremium === true ||
        String(userData?.accesoPremium).toLowerCase() === 'true' ||
        userData?.accesoPremium === 1;

    const logout = async () => {
        try {
            await auth.signOut();
            window.location.href = '/login';
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, userData, isPremium, loading, logout, activateLicense }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
