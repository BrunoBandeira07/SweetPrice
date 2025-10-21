
"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MailCheck } from "lucide-react";

interface EmailVerificationAlertProps {
    email: string;
}

export default function EmailVerificationAlert({ email }: EmailVerificationAlertProps) {
    return (
        <Alert variant="default" className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800 [&>svg]:text-green-600 dark:[&>svg]:text-green-400">
            <MailCheck className="h-4 w-4" />
            <AlertTitle>Verifique o seu e-mail!</AlertTitle>
            <AlertDescription>
                Enviámos um link de confirmação para <strong>{email}</strong>. Por favor, clique no link para ativar a sua conta antes de fazer o login.
            </AlertDescription>
        </Alert>
    );
}

