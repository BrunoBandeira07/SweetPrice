
'use client';

import { useUser, useFirestore } from '@/firebase/provider';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { seedInitialData } from '@/firebase/seed-data';
import { Loader2 } from 'lucide-react';
import { getRedirectResult } from 'firebase/auth';
import { useAuth } from '@/firebase';

export default function AuthGate({ children }: { children: React.ReactNode }) {
    const { user, isUserLoading } = useUser();
    const auth = useAuth();
    const firestore = useFirestore();
    const router = useRouter();
    const pathname = usePathname();
    const [isSeeding, setIsSeeding] = useState(false);
    const [isVerifying, setIsVerifying] = useState(true);

    useEffect(() => {
        getRedirectResult(auth)
            .then((result) => {
                if (result) {
                    console.log("Redirect result processed for user:", result.user.uid);
                }
            })
            .catch((error) => {
                console.error("Error processing redirect result:", error.code);
                // If the specific error is 'operation-not-allowed', redirect to login with an error param
                if (error.code === 'auth/operation-not-allowed') {
                    router.replace('/login?error=operation-not-allowed');
                }
            })
            .finally(() => {
                setIsVerifying(false);
            });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [auth]);

    useEffect(() => {
        if (isUserLoading || isVerifying) {
            return;
        }

        if (!user) {
            if (pathname !== '/login') {
                router.replace('/login');
            }
        } else {
            setIsSeeding(true);
            const userSettingsRef = doc(firestore, 'settings', user.uid);
            getDoc(userSettingsRef).then(docSnap => {
                if (!docSnap.exists()) {
                    console.log("New user detected, seeding initial data...");
                    seedInitialData(user.uid, firestore).finally(() => {
                        console.log("Seeding complete.");
                        setIsSeeding(false);
                        if (pathname === '/login') {
                            router.replace('/');
                        }
                    });
                } else {
                    setIsSeeding(false);
                    if (pathname === '/login') {
                        router.replace('/');
                    }
                }
            }).catch(err => {
                console.error("Error checking user settings:", err);
                setIsSeeding(false);
            });
        }

    }, [user, isUserLoading, isVerifying, pathname, router, firestore]);

    if (isUserLoading || isVerifying || isSeeding || (!user && pathname !== '/login')) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    if ((user && !isSeeding) || pathname === '/login') {
        return <>{children}</>;
    }

    return null;
}
