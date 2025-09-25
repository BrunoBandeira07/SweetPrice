
"use client";

import { useState } from 'react';
import { Customer, Recipe } from '@/lib/types';
import { Quote, QuoteItem } from '@/app/quotes/page';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Plus, Trash2 } from 'lucide-react';

interface QuoteBuilderProps {
    customers: Customer[];
    recipes: Recipe[];
    quote: Quote;
    setQuote: (quote: Partial<Quote>) => void;
}

export default function QuoteBuilder({ customers, recipes, quote, setQuote }: QuoteBuilderProps) {
    const [selectedRecipeId, setSelectedRecipeId] = useState<string>('');
    const [quantity, setQuantity] = useState<number>(1);
    
    const handleCustomerSelect = (customerId: string) => {
        const customer = customers.find(c => c.id === customerId);
        setQuote({ customer: customer || {} });
    };
    
    const handleAddItem = () => {
        const recipe = recipes.find(r => r.id === selectedRecipeId);
        if (!recipe || quantity <= 0) return;

        const newItem: QuoteItem = {
            id: `${recipe.id}-${Date.now()}`,
            recipe,
            quantity,
            unitPrice: recipe.suggestedPrice || 0,
            total: (recipe.suggestedPrice || 0) * quantity,
        };

        setQuote({ items: [...quote.items, newItem] });
        setSelectedRecipeId('');
        setQuantity(1);
    };

    const handleRemoveItem = (itemId: string) => {
        const updatedItems = quote.items.filter(item => item.id !== itemId);
        setQuote({ items: updatedItems });
    };

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Montar Orçamento</CardTitle>
                <CardDescription>Selecione o cliente, adicione produtos e defina os termos.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Customer Selection */}
                <div className="space-y-2">
                    <Label>Cliente</Label>
                    <Select onValueChange={handleCustomerSelect} value={quote.customer.id}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione um cliente" />
                        </SelectTrigger>
                        <SelectContent>
                            {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Input 
                        placeholder="Ou digite o nome do cliente" 
                        value={quote.customer.name || ''}
                        onChange={e => setQuote({ customer: { ...quote.customer, name: e.target.value } })}
                    />
                </div>

                {/* Item Adder */}
                <div className="space-y-2">
                    <Label>Adicionar Item</Label>
                    <div className="flex items-center gap-2">
                        <div className="flex-grow">
                             <Select onValueChange={setSelectedRecipeId} value={selectedRecipeId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione um produto" />
                                </SelectTrigger>
                                <SelectContent>
                                    {recipes.map(r => <SelectItem key={r.id} value={r.id}>{r.name} - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(r.suggestedPrice || 0)}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <Input 
                            type="number" 
                            min="1" 
                            className="w-20"
                            value={quantity}
                            onChange={e => setQuantity(Number(e.target.value))}
                        />
                        <Button size="icon" onClick={handleAddItem} disabled={!selectedRecipeId}>
                            <Plus />
                        </Button>
                    </div>
                </div>

                {/* Items List */}
                <div className="space-y-2">
                    <Label>Itens do Orçamento</Label>
                    {quote.items.length > 0 ? (
                        <div className="space-y-2">
                            {quote.items.map(item => (
                                <div key={item.id} className="flex justify-between items-center bg-muted/50 p-2 rounded-md">
                                    <div>
                                        <p className="font-semibold">{item.quantity}x {item.recipe.name}</p>
                                        <p className="text-sm text-muted-foreground">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.total)}</p>
                                    </div>
                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleRemoveItem(item.id)}>
                                        <Trash2 />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-sm text-muted-foreground py-4 border-2 border-dashed rounded-md">
                            Nenhum item adicionado.
                        </div>
                    )}
                </div>

                 {/* Notes and Validity */}
                <div className="space-y-2">
                    <Label htmlFor="notes">Observações</Label>
                    <Textarea 
                        id="notes" 
                        placeholder="Ex: Condições de pagamento, detalhes da entrega, etc."
                        value={quote.notes}
                        onChange={e => setQuote({ notes: e.target.value })}
                    />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="validity">Validade do Orçamento (dias)</Label>
                    <Input 
                        id="validity" 
                        type="number"
                        min="1"
                        value={quote.validityInDays}
                        onChange={e => setQuote({ validityInDays: Number(e.target.value) })}
                    />
                </div>

            </CardContent>
        </Card>
    );
}
