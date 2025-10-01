
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Lightbulb, Loader2, RefreshCw } from "lucide-react";
import { getDashboardSuggestion } from "@/app/actions";
import { Skeleton } from "../ui/skeleton";

interface AiSuggestionCardProps {
    criticalStockCount: number;
    monthlySales: number;
}


export default function AiSuggestionCard({ criticalStockCount, monthlySales }: AiSuggestionCardProps) {
    const [suggestion, setSuggestion] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchSuggestion = async () => {
        setIsLoading(true);
        // We use a date string as a key to get a new suggestion once a day
        const today = new Date().toISOString().split('T')[0];
        const storedSuggestion = localStorage.getItem('dashboardSuggestion');
        const storedDate = localStorage.getItem('dashboardSuggestionDate');

        if (storedSuggestion && storedDate === today) {
            setSuggestion(storedSuggestion);
            setIsLoading(false);
            return;
        }

        const result = await getDashboardSuggestion({ criticalStockCount, monthlySales });
        if (result.success && result.suggestion) {
            setSuggestion(result.suggestion);
            localStorage.setItem('dashboardSuggestion', result.suggestion);
            localStorage.setItem('dashboardSuggestionDate', today);
        } else {
            setSuggestion("Não foi possível gerar uma sugestão no momento.");
        }
        setIsLoading(false);
    }

    useEffect(() => {
        fetchSuggestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [criticalStockCount, monthlySales]);
    

    return (
        <Card className="bg-primary/5 dark:bg-primary/10 border-primary/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="text-primary"/>
                    Sugestão do Dia
                </CardTitle>
                <CardDescription>Uma dica rápida gerada por IA para te ajudar a vender mais ou gerenciar melhor seu negócio.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {isLoading ? (
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-[80%]" />
                    </div>
                ) : (
                    <p className="italic">"{suggestion}"</p>
                )}

                <Button variant="ghost" size="sm" onClick={fetchSuggestion} disabled={isLoading}>
                    {isLoading ? (
                        <Loader2 className="mr-2 animate-spin" />
                    ) : (
                        <RefreshCw className="mr-2" />
                    )}
                    Gerar nova sugestão
                </Button>
            </CardContent>
        </Card>
    );
}
