
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
    isLoading: boolean;
}


export default function AiSuggestionCard({ criticalStockCount, monthlySales, isLoading: isLoadingProps }: AiSuggestionCardProps) {
    const [suggestion, setSuggestion] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    
    const isLoading = isLoadingProps || isGenerating;

    const fetchSuggestion = async (forceRefresh = false) => {
        setIsGenerating(true);
        const today = new Date().toISOString().split('T')[0];
        const storedSuggestion = localStorage.getItem('dashboardSuggestion');
        const storedDate = localStorage.getItem('dashboardSuggestionDate');

        if (storedSuggestion && storedDate === today && !forceRefresh) {
            setSuggestion(storedSuggestion);
            setIsGenerating(false);
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
        setIsGenerating(false);
    }

    useEffect(() => {
        // Only fetch if data is not loading from props
        if (!isLoadingProps) {
            fetchSuggestion();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoadingProps, criticalStockCount, monthlySales]);
    

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

                <Button variant="ghost" size="sm" onClick={() => fetchSuggestion(true)} disabled={isLoading}>
                    {isLoading ? (
                        <Loader2 className="mr-2 animate-spin" />
                    ) : (
                        <RefreshCw className="mr-2" />
                    )}
                    {isGenerating ? 'Gerando...' : 'Gerar nova sugestão'}
                </Button>
            </CardContent>
        </Card>
    );
}
