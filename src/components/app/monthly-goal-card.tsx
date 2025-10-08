
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Progress } from '../ui/progress';
import { Check, Edit, Save, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useMemoFirebase } from "@/firebase/provider";
import { doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Skeleton } from '../ui/skeleton';

interface MonthlyGoalCardProps {
    currentSales: number;
    monthlyGoal: number | undefined;
    isLoading: boolean;
}

export default function MonthlyGoalCard({ currentSales, monthlyGoal, isLoading }: MonthlyGoalCardProps) {
    const { toast } = useToast();
    const { user } = useUser();
    const firestore = useFirestore();

    const settingsDocRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'settings', user.uid);
    }, [firestore, user]);
    
    const [goal, setGoal] = useState(1000);
    const [isEditing, setIsEditing] = useState(false);
    const [tempGoal, setTempGoal] = useState(goal);

    useEffect(() => {
        if (monthlyGoal !== undefined) {
            setGoal(monthlyGoal);
            setTempGoal(monthlyGoal);
        }
    }, [monthlyGoal]);

    const progress = goal > 0 ? (currentSales / goal) * 100 : 0;
    const goalMet = currentSales >= goal;

    const handleSave = () => {
        if (!settingsDocRef || !user) return;
        
        setDocumentNonBlocking(settingsDocRef, { monthlyGoal: tempGoal, userId: user.uid, id: user.uid }, { merge: true });
        setGoal(tempGoal);
        setIsEditing(false);

        toast({
            title: "Meta Atualizada!",
            description: "Sua meta de vendas para o mês foi definida.",
        });
    };
    
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/2"/>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Target />
                        Meta Mensal
                    </CardTitle>
                    {!isEditing && (
                        <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
                            <Edit className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {isEditing ? (
                    <div className="flex items-center gap-2">
                        <Input
                            type="number"
                            value={tempGoal}
                            onChange={(e) => setTempGoal(parseFloat(e.target.value))}
                            className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <Button size="icon" onClick={handleSave}>
                            <Save className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <div>
                        {goalMet && goal > 0 ? (
                             <div className="flex flex-col items-center justify-center text-center p-4 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <Check className="h-8 w-8 text-green-600 mb-2"/>
                                <p className="font-bold text-green-700 dark:text-green-300">Meta Alcançada!</p>
                            </div>
                        ) : (
                             <Progress value={progress} className="w-full" />
                        )}
                        <p className="text-sm text-muted-foreground text-center mt-2">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentSales)} de {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(goal)}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
