

"use client";

import { useState } from 'react';
import QuoteBuilder from '@/components/app/quote-builder';
import QuotePreview from '@/components/app/quote-preview';
import type { Customer, Recipe } from '@/lib/types';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useUser, useFirestore, useMemoFirebase } from "@/firebase/provider";
import { collection, query, where } from 'firebase/firestore';

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
    const firestore = useFirestore();
    const { user } = useUser();

    const customersQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, 'customers'), where('userId', '==', user.uid));
    }, [firestore, user]);
    const { data: customers = [] } = useCollection<Customer>(customersQuery);

    const recipesQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, 'recipes'), where('userId', '==', user.uid));
    }, [firestore, user]);
    const { data: recipes = [] } = useCollection<Recipe>(recipesQuery);

    const [quote, setQuote] = useState<Quote>({
        customer: {},
        items: [],
        notes: '',
        validityInDays: 7,
        total: 0,
    });

    const updateQuote = (newQuoteData: Partial<Quote>) => {
        const updatedQuote = { ...quote, ...newQuoteData };
        const total = updatedQuote.items.reduce((acc, item) => acc + item.total, 0);
        setQuote({ ...updatedQuote, total });
    };

    const validRecipes = recipes.filter(r => r.name && r.suggestedPrice && r.suggestedPrice > 0);

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

    
