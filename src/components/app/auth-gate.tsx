
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
        // When the app loads, check if there's a sign-in redirect result
        getRedirectResult(auth)
            .then((result) => {
                // If there's a result, it means the user just signed in.
                // onAuthStateChanged will handle the user state update.
                // We just need to stop showing the loader.
                if (result) {
                    console.log("Redirect result processed.");
                }
            })
            .catch((error) => {
                console.error("Error processing redirect result:", error);
            })
            .finally(() => {
                // Whether there was a redirect or not, we're done verifying.
                setIsVerifying(false);
            });
    }, [auth]);

    useEffect(() => {
        // This effect runs when either user loading state or verification state changes.
        if (isUserLoading || isVerifying) {
            return; // Wait until both Firebase auth state and redirect check are done.
        }

        // If not loading and not verifying, we can make routing decisions.
        if (!user) {
            // If there's no user and we are not on the login page, redirect to login.
            if (pathname !== '/login') {
                router.replace('/login');
            }
        } else {
            // If there is a user, check for seeding.
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

    // Show a loading screen during auth check, redirect verification, or data seeding.
    if (isUserLoading || isVerifying || isSeeding || (!user && pathname !== '/login')) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    // If we've passed all checks and the user is logged in, or we're on the login page.
    if (user || pathname === '/login') {
        return <>{children}</>;
    }

    // Fallback, should be covered by the loading state.
    return null;
}
