
'use client';

import { useUser, useFirestore } from '@/firebase/provider';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { seedInitialData } from '@/firebase/seed-data';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/firebase';

export default function AuthGate({ children }: { children: React.ReactNode }) {
    const { user, isUserLoading } = useUser();
    const auth = useAuth();
    const firestore = useFirestore();
    const router = useRouter();
    const pathname = usePathname();
    const [isSeeding, setIsSeeding] = useState(false);
    
    // isVerifying state is no longer needed with signInWithPopup
    // as the onAuthStateChanged listener handles the user state directly.

    useEffect(() => {
        if (isUserLoading) {
            return; // Wait until Firebase has determined the auth state.
        }

        if (!user) {
            // If there's no user and we are not on the login page, redirect to login.
            if (pathname !== '/login') {
                router.replace('/login');
            }
        } else {
            // User is authenticated. Check if we need to seed data.
            setIsSeeding(true);
            const userSettingsRef = doc(firestore, 'settings', user.uid);
            getDoc(userSettingsRef).then(docSnap => {
                if (!docSnap.exists()) {
                    console.log("New user detected, seeding initial data...");
                    seedInitialData(user.uid, firestore).finally(() => {
                        console.log("Seeding complete.");
                        setIsSeeding(false);
                        // If user was on login page, redirect to home.
                        if (pathname === '/login') {
                            router.replace('/');
                        }
                    });
                } else {
                    // User already has data, no need to seed.
                    setIsSeeding(false);
                    // If user was on login page, redirect to home.
                    if (pathname === '/login') {
                        router.replace('/');
                    }
                }
            }).catch(err => {
                console.error("Error checking user settings:", err);
                setIsSeeding(false);
            });
        }

    }, [user, isUserLoading, pathname, router, firestore]);

    // Show a loading spinner while auth state is being determined, or while seeding data.
    // Also show loading if we're not on the login page and don't have a user yet (avoids flashing content).
    if (isUserLoading || isSeeding || (!user && pathname !== '/login')) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    // If we have a user (and not seeding) OR we are on the login page, render the children.
    if ((user && !isSeeding) || pathname === '/login') {
        return <>{children}</>;
    }

    // Fallback, should not be reached in normal flow.
    return null;
}
