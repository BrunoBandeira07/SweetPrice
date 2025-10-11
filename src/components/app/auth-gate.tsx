
'use client';

import { useUser, useFirestore } from '@/firebase/provider';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { seedInitialData } from '@/firebase/seed-data';
import { Loader2 } from 'lucide-react';

export default function AuthGate({ children }: { children: React.ReactNode }) {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const pathname = usePathname();
    const [isSeeding, setIsSeeding] = useState(false);

    useEffect(() => {
        if (!isUserLoading) {
            // If user is not logged in and not on the login page, redirect
            if (!user && pathname !== '/login') {
                router.replace('/login');
            }
            // If user is logged in
            if (user) {
                setIsSeeding(true);
                const userSettingsRef = doc(firestore, 'settings', user.uid);
                getDoc(userSettingsRef).then(docSnap => {
                    // If the settings doc doesn't exist, it's a new user
                    if (!docSnap.exists()) {
                        console.log("New user detected, seeding initial data...");
                        seedInitialData(user.uid, firestore).then(() => {
                            console.log("Seeding complete.");
                            setIsSeeding(false);
                            if (pathname === '/login') {
                                router.replace('/');
                            }
                        });
                    } else {
                        // User already exists, no seeding needed
                        setIsSeeding(false);
                         if (pathname === '/login') {
                            router.replace('/');
                        }
                    }
                });
            }
        }
    }, [user, isUserLoading, pathname, router, firestore]);

    // Show a loading screen during auth check or data seeding
    if (isUserLoading || isSeeding || (!user && pathname !== '/login')) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    // If user is logged in or on the login page, show the content
    if (user || pathname === '/login') {
        return <>{children}</>;
    }

    // Fallback, should be covered by the loading state
    return null;
}
