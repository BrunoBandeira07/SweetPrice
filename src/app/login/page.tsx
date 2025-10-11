
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { GoogleAuthProvider, signInWithPopup, AuthError } from 'firebase/auth';
import { useAuth } from '@/firebase/provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Cake, AlertTriangle } from 'lucide-react';

const GoogleIcon = () => (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48" fill="currentColor">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.021,35.592,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
    </svg>
);

export default function LoginPage() {
    const auth = useAuth();
    const searchParams = useSearchParams();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const errorCode = searchParams.get('error');
        if (errorCode === 'operation-not-allowed') {
            setError("O login com Google não está ativado para este projeto. Por favor, ative-o no Painel do Firebase em Authentication > Sign-in method.");
        }
    }, [searchParams]);

    const handleGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        setError(null);
        try {
            await signInWithPopup(auth, provider);
            // On successful sign-in, AuthGate will handle the redirect.
        } catch (e) {
            const error = e as AuthError;
            console.error("Popup sign-in error:", error.code);
            if (error.code === 'auth/operation-not-allowed') {
                setError("O login com Google não está ativado para este projeto. Por favor, ative-o no Painel do Firebase em Authentication > Sign-in method.");
            } else if (error.code === 'auth/popup-blocked') {
                setError("O pop-up de login foi bloqueado pelo seu browser. Por favor, permita pop-ups para este site e tente novamente.");
            } else if (error.code === 'auth/popup-closed-by-user') {
                // User closed the popup intentionally, do not show an error.
                setError(null); 
            } else if (error.code === 'auth/unauthorized-domain') {
                setError("Este domínio não está autorizado para operações OAuth. Adicione-o à lista de domínios autorizados no painel do Firebase.");
            }
            else {
                setError("Ocorreu um erro inesperado durante o login. Tente novamente.");
            }
        }
    };
    
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                <div className="flex flex-col space-y-2 text-center">
                    <Cake className="mx-auto h-10 w-10 text-primary" />
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                        Entrar no Precifica Céu
                    </h1>
                </div>

                <Card>
                    <CardContent className="p-6 space-y-4">
                         {error && (
                            <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Erro de Login</AlertTitle>
                                <AlertDescription>
                                    {error}
                                </AlertDescription>
                            </Alert>
                        )}
                        <Button 
                            className="w-full" 
                            variant="outline"
                            onClick={handleGoogleSignIn}
                        >
                            <GoogleIcon />
                            Continuar com Google
                        </Button>
                    </CardContent>
                </Card>
                
                 <p className="px-8 text-center text-sm text-muted-foreground">
                    Ao clicar em continuar, você concorda com nossos{" "}
                    <a
                        href="#"
                        className="underline underline-offset-4 hover:text-primary"
                    >
                        Termos de Serviço
                    </a>{" "}
                    e{" "}
                    <a
                        href="#"
                        className="underline underline-offset-4 hover:text-primary"
                    >
                        Política de Privacidade
                    </a>
                    .
                </p>
            </div>
        </div>
    );
}
