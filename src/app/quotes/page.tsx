
"use client";

import { useState, useEffect } from 'react';
import AppHeader from '@/components/app/header';
import QuoteBuilder from '@/components/app/quote-builder';
import QuotePreview from '@/components/app/quote-preview';
import type { Customer, Recipe, RecipeItem } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export interface QuoteItem {
    id: string;
    recipe: Recipe;
    quantity: number;
    unitPrice: number;
    total: number;
}

export interface Quote {
    customer: Partial<Customer>;
    items: QuoteItem[];
    notes: string;
    validityInDays: number;
    total: number;
}


export default function QuotesPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [quote, setQuote] = useState<Quote>({
        customer: {},
        items: [],
        notes: '',
        validityInDays: 7,
        total: 0,
    });
    const { toast } = useToast();

    useEffect(() => {
        try {
            const storedCustomers = localStorage.getItem('customers');
            if (storedCustomers) {
                setCustomers(JSON.parse(storedCustomers));
            }
            const storedRecipes = localStorage.getItem('savedRecipes');
            if (storedRecipes) {
                const parsedRecipes = JSON.parse(storedRecipes);
                const validRecipes = parsedRecipes.filter((r: Recipe) => r.name && r.suggestedPrice);
                setRecipes(validRecipes);
            }
        } catch (error) {
            console.error("Failed to load data from localStorage", error);
            toast({
                variant: 'destructive',
                title: 'Erro ao carregar dados',
                description: 'Não foi possível carregar clientes ou receitas salvos.'
            })
        }
    }, [toast]);

    const updateQuote = (newQuoteData: Partial<Quote>) => {
        const updatedQuote = { ...quote, ...newQuoteData };
        const total = updatedQuote.items.reduce((acc, item) => acc + item.total, 0);
        setQuote({ ...updatedQuote, total });
    };

    return (
        <div className="min-h-screen w-full">
            <AppHeader />
            <main className="container mx-auto p-4 md:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
                    <div className="lg:col-span-2">
                        <QuoteBuilder 
                            customers={customers}
                            recipes={recipes}
                            quote={quote}
                            setQuote={updateQuote}
                        />
                    </div>
                     <div className="lg:col-span-3">
                        <QuotePreview quote={quote} />
                    </div>
                </div>
            </main>
        </div>
    );
}
