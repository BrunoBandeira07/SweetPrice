
"use client";

import { useState, useEffect } from 'react';
import QuoteBuilder from '@/components/app/quote-builder';
import QuotePreview from '@/components/app/quote-preview';
import type { Customer, Recipe } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import { collection } from 'firebase/firestore';

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
    
    const firestore = useFirestore();
    const recipesCollection = useMemoFirebase(() => collection(firestore, 'recipes'), [firestore]);
    const { data: recipes = [] } = useCollection<Recipe>(recipesCollection);

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
        } catch (error) {
            console.error("Failed to load data from localStorage", error);
            toast({
                variant: 'destructive',
                title: 'Erro ao carregar dados',
                description: 'Não foi possível carregar clientes.'
            })
        }
    }, [toast]);

    const updateQuote = (newQuoteData: Partial<Quote>) => {
        const updatedQuote = { ...quote, ...newQuoteData };
        const total = updatedQuote.items.reduce((acc, item) => acc + item.total, 0);
        setQuote({ ...updatedQuote, total });
    };

    const validRecipes = recipes.filter(r => r.name && r.suggestedPrice);

    return (
        <div className="w-full">
            <main className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
                <div className="lg:col-span-2">
                    <QuoteBuilder 
                        customers={customers}
                        recipes={validRecipes}
                        quote={quote}
                        setQuote={updateQuote}
                    />
                </div>
                    <div className="lg:col-span-3">
                    <QuotePreview quote={quote} />
                </div>
            </main>
        </div>
    );
}
