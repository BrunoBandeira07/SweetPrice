
'use client';

import { useState } from 'react';
import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword, AuthError } from 'firebase/auth';
import { useAuth } from '@/firebase/provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Cake, AlertTriangle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import EmailVerificationAlert from '@/components/app/email-verification-alert';


const GoogleIcon = () => (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48" fill="currentColor">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C41.31,34.56,44,29.865,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
    </svg>
);


export default function LoginPage() {
    const auth = useAuth();
    const [error, setError] = useState<string | null>(null);
    const [emailForVerification, setEmailForVerification] = useState<string | null>(null);

    const handleGoogleSignIn = async () => {
        setError(null);
        setEmailForVerification(null);
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            // On successful login, the AuthGate component will handle the redirect.
        } catch (e) {
            const error = e as AuthError;
            console.error("Popup sign-in error:", error.code);
            if (error.code === 'auth/operation-not-allowed') {
                setError("O login com Google não está ativado para este projeto. Por favor, ative-o no Painel do Firebase em Authentication > Sign-in method.");
            } else if (error.code === 'auth/popup-blocked') {
                setError("O pop-up de login foi bloqueado pelo seu navegador. Por favor, permita pop-ups para este site e tente novamente.");
            } else if (error.code === 'auth/popup-closed-by-user') {
                // User closed the popup, this is not a real error, so we just ignore it.
                return;
            } else {
                setError("Ocorreu um erro inesperado durante o login com o Google. Tente novamente.");
            }
        }
    };
    
    const handleEmailSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setEmailForVerification(null);

        const formData = new FormData(event.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await sendEmailVerification(userCredential.user);
            setEmailForVerification(email);
        } catch (e) {
             const error = e as AuthError;
            if (error.code === 'auth/email-already-in-use') {
                setError("Este e-mail já está em uso. Tente fazer login ou use um e-mail diferente.");
            } else if (error.code === 'auth/weak-password') {
                setError("A senha é muito fraca. Ela deve ter pelo menos 6 caracteres.");
            } else {
                setError("Ocorreu um erro inesperado durante o cadastro. Tente novamente.");
            }
        }
    };
    
    const handleEmailSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setEmailForVerification(null);

        const formData = new FormData(event.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            if (!userCredential.user.emailVerified) {
                setError("Seu e-mail ainda não foi verificado. Por favor, verifique sua caixa de entrada.");
                // Optionally resend verification email
                // await sendEmailVerification(userCredential.user);
            }
            // On successful login (and verified email), AuthGate will redirect.
        } catch (e) {
            const error = e as AuthError;
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                setError("E-mail ou senha inválidos. Por favor, verifique suas credenciais e tente novamente.");
            } else {
                 setError("Ocorreu um erro inesperado ao fazer login. Tente novamente.");
            }
        }
    }


    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-background px-4">
            <div className="w-full max-w-sm space-y-6">
                 <div className="text-center space-y-2">
                    <Cake className="mx-auto h-12 w-12 text-primary" />
                    <h1 className="text-3xl font-bold">Precifica Céu</h1>
                    <p className="text-muted-foreground">Acesse sua conta para continuar</p>
                </div>
                 
                 <Tabs defaultValue="login" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="login">Entrar</TabsTrigger>
                        <TabsTrigger value="signup">Criar Conta</TabsTrigger>
                    </TabsList>
                    <TabsContent value="login">
                        <Card>
                            <CardContent className="pt-6">
                                <form onSubmit={handleEmailSignIn} className="space-y-4">
                                     <div className="space-y-2">
                                        <Label htmlFor="login-email">Email</Label>
                                        <Input id="login-email" name="email" type="email" placeholder="seu@email.com" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="login-password">Senha</Label>
                                        <Input id="login-password" name="password" type="password" required />
                                    </div>
                                    <Button type="submit" className="w-full">Entrar</Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="signup">
                       <Card>
                            <CardContent className="pt-6">
                                <form onSubmit={handleEmailSignUp} className="space-y-4">
                                     <div className="space-y-2">
                                        <Label htmlFor="signup-email">Email</Label>
                                        <Input id="signup-email" name="email" type="email" placeholder="seu@email.com" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="signup-password">Senha</Label>
                                        <Input id="signup-password" name="password" type="password" required />
                                    </div>
                                    <Button type="submit" className="w-full">Criar Conta</Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                            Ou continue com
                        </span>
                    </div>
                </div>

                <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>
                    <GoogleIcon />
                    Google
                </Button>

                {error && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Erro de Autenticação</AlertTitle>
                        <AlertDescription>
                            {error}
                        </AlertDescription>
                    </Alert>
                )}

                {emailForVerification && (
                    <EmailVerificationAlert email={emailForVerification}/>
                )}
            </div>
        </div>
    );
}

    