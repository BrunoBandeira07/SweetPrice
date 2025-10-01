
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Progress } from '../ui/progress';
import { Check, Edit, Save, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MonthlyGoalCardProps {
    currentSales: number;
}

export default function MonthlyGoalCard({ currentSales }: MonthlyGoalCardProps) {
    const [goal, setGoal] = useState(1000);
    const [isEditing, setIsEditing] = useState(false);
    const [tempGoal, setTempGoal] = useState(goal);
    const { toast } = useToast();

    useEffect(() => {
        const savedGoal = localStorage.getItem('monthlyGoal');
        if (savedGoal) {
            const parsedGoal = parseFloat(savedGoal);
            setGoal(parsedGoal);
            setTempGoal(parsedGoal);
        }
    }, []);

    const progress = (currentSales / goal) * 100;
    const goalMet = currentSales >= goal;

    const handleSave = () => {
        setGoal(tempGoal);
        localStorage.setItem('monthlyGoal', tempGoal.toString());
        setIsEditing(false);
        toast({
            title: "Meta Atualizada!",
            description: "Sua meta de vendas para o mês foi definida.",
        });
    };

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
                        {goalMet ? (
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
