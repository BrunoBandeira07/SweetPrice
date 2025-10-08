
"use client";

import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { Order, Recipe } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useMemo } from 'react';

const orderFormSchema = z.object({
  customerName: z.string().min(2, 'Nome do cliente é obrigatório.'),
  deliveryDate: z.date({ required_error: 'Data de entrega é obrigatória.'}),
  items: z.array(z.object({
    recipeId: z.string().min(1, "Selecione uma receita"),
    quantity: z.coerce.number().min(1, 'Quantidade deve ser no mínimo 1'),
  })).min(1, "Adicione pelo menos um item à encomenda."),
});

type OrderFormValues = z.infer<typeof orderFormSchema>;

interface AddOrderFormProps {
    onAddOrder: (order: Omit<Order, 'id' | 'userId' | 'deliveryStatus' | 'productionStatus'>) => void;
    recipes: Recipe[];
}

export default function AddOrderForm({ onAddOrder, recipes }: AddOrderFormProps) {
    const { toast } = useToast();

    const form = useForm<OrderFormValues>({
        resolver: zodResolver(orderFormSchema),
        defaultValues: {
            customerName: '',
            items: [{ recipeId: '', quantity: 1 }],
        },
    });

    const { control, handleSubmit, register, reset, watch } = form;
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'items',
    });
    
    const validRecipes = recipes.filter(r => r.suggestedPrice && r.suggestedPrice > 0);

    const watchedItems = watch('items');
    const total = useMemo(() => watchedItems.reduce((acc, currentItem) => {
        const recipe = recipes.find(r => r.id === currentItem.recipeId);
        return acc + (recipe?.suggestedPrice || 0) * currentItem.quantity;
    }, 0), [watchedItems, recipes]);


    const onSubmit = (data: OrderFormValues) => {
        const orderItems = data.items.map(item => {
            const recipe = recipes.find(r => r.id === item.recipeId);
            if (!recipe) throw new Error("Receita não encontrada");
            return { recipe, quantity: item.quantity };
        });

        const newOrder: Omit<Order, 'id' | 'deliveryStatus' | 'productionStatus'> = {
            customerName: data.customerName,
            deliveryDate: data.deliveryDate.toISOString(),
            items: orderItems,
            total: total,
        };
        onAddOrder(newOrder);
        reset();
        toast({
            title: "Encomenda Adicionada!",
            description: "A nova encomenda foi registrada com sucesso.",
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Adicionar Nova Encomenda</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label htmlFor="customerName">Nome do Cliente</Label>
                            <Input id="customerName" {...register('customerName')} placeholder="Ex: João da Silva"/>
                             {form.formState.errors.customerName && <p className="text-sm text-destructive">{form.formState.errors.customerName.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Data de Entrega</Label>
                            <Controller
                                name="deliveryDate"
                                control={control}
                                render={({ field }) => (
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !field.value && "text-muted-foreground"
                                            )}
                                            >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {field.value ? format(field.value, "PPP", {}) : <span>Selecione uma data</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                )}
                            />
                             {form.formState.errors.deliveryDate && <p className="text-sm text-destructive">{form.formState.errors.deliveryDate.message}</p>}
                        </div>
                    </div>
                   
                    <div>
                        <Label>Itens da Encomenda</Label>
                        <div className="space-y-4 mt-2">
                        {fields.map((field, index) => (
                            <div key={field.id} className="flex items-center gap-2 p-2 border rounded-lg">
                                <div className="grid grid-cols-2 gap-2 flex-grow">
                                    <Controller
                                        name={`items.${index}.recipeId`}
                                        control={control}
                                        render={({ field }) => (
                                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione a receita" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {validRecipes.map(recipe => (
                                                        <SelectItem key={recipe.id} value={recipe.id}>{recipe.name} - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(recipe.suggestedPrice || 0)}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    <Input 
                                        type="number"
                                        min="1"
                                        {...register(`items.${index}.quantity`)}
                                        placeholder="Qtd."
                                    />
                                </div>
                                <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                                    <Trash2 />
                                </Button>
                            </div>
                        ))}
                        </div>
                        <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ recipeId: '', quantity: 1 })}>
                            <Plus className="mr-2"/> Adicionar Item
                        </Button>
                        {form.formState.errors.items && <p className="text-sm text-destructive mt-2">{form.formState.errors.items.message}</p>}
                    </div>

                    <div className="border-t pt-4 space-y-2">
                        <div className="flex justify-between items-center text-lg font-bold">
                            <span>Total da Encomenda:</span>
                            <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}</span>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit">Salvar Encomenda</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
