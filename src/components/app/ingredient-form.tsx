"use client";

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, RotateCw } from 'lucide-react';

import type { Ingredient } from '@/lib/types';
import { UNITS } from '@/lib/constants';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const formSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres.'),
  packageSize: z.coerce.number().positive('O tamanho deve ser um número positivo.'),
  cost: z.coerce.number().positive('O custo deve ser um número positivo.'),
  unit: z.enum(['g', 'kg', 'ml', 'l', 'un'], { required_error: 'Selecione uma unidade.' }),
  supplier: z.string().optional(),
});

type IngredientFormValues = z.infer<typeof formSchema>;

interface IngredientFormProps {
  onSubmit: (ingredient: Ingredient) => void;
  editingIngredient?: Ingredient;
  onCancel: () => void;
}

const IngredientForm = ({ onSubmit, editingIngredient, onCancel }: IngredientFormProps) => {
  const form = useForm<IngredientFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      packageSize: 0,
      cost: 0,
      supplier: '',
    },
  });

  useEffect(() => {
    if (editingIngredient) {
      form.reset(editingIngredient);
    } else {
      form.reset({ name: '', packageSize: 0, cost: 0, supplier: '' });
    }
  }, [editingIngredient, form]);

  const handleFormSubmit = (values: IngredientFormValues) => {
    const ingredientData: Ingredient = {
      id: editingIngredient?.id || new Date().toISOString(),
      ...values,
    };
    onSubmit(ingredientData);
    form.reset({ name: '', packageSize: 0, cost: 0, supplier: '' });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-start">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="lg:col-span-2">
                <FormLabel>Nome do Ingrediente</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Farinha de Trigo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="packageSize"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tamanho (Embalagem)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="Ex: 1000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unidade</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Unidade" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {UNITS.map(unit => (
                      <SelectItem key={unit.value} value={unit.value}>{unit.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Custo (R$)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="Ex: 5.50" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="supplier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fornecedor</FormLabel>
                <FormControl>
                  <Input placeholder="(Opcional)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end space-x-2">
          {editingIngredient && (
             <Button type="button" variant="ghost" onClick={onCancel}>
                Cancelar
              </Button>
          )}
          <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            {editingIngredient ? <RotateCw /> : <Plus />}
            {editingIngredient ? 'Atualizar Ingrediente' : 'Adicionar Ingrediente'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default IngredientForm;
