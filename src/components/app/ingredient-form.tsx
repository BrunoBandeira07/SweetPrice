"use client";

import { useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, RotateCw, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

import type { Ingredient } from '@/lib/types';
import { UNITS } from '@/lib/constants';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';

const formSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres.'),
  packageSize: z.coerce.number().positive('O tamanho deve ser um número positivo.'),
  cost: z.coerce.number().positive('O custo deve ser um número positivo.'),
  unit: z.enum(['g', 'kg', 'ml', 'l', 'un'], { required_error: 'Selecione uma unidade.' }),
  supplier: z.string().optional(),
  category: z.string().optional(),
  unitCost: z.coerce.number().optional(),
  lossFactor: z.coerce.number().optional(),
  stockQuantity: z.coerce.number().optional(),
  lowStockThreshold: z.coerce.number().optional(),
  expirationDate: z.string().optional(),
});

type IngredientFormValues = z.infer<typeof formSchema>;

interface IngredientFormProps {
  onSubmit: (ingredient: Omit<Ingredient, 'id'> & { id?: string }) => void;
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
      category: '',
      unitCost: undefined,
      lossFactor: undefined,
      stockQuantity: 0,
      lowStockThreshold: 0,
      expirationDate: undefined,
    },
  });

  const { watch, setValue, control } = form;
  const packageSize = watch('packageSize');
  const cost = watch('cost');
  
  const calculatedUnitCost = useMemo(() => {
    if (packageSize > 0 && cost > 0) {
      return cost / packageSize;
    }
    return 0;
  }, [packageSize, cost]);

  useEffect(() => {
    if (calculatedUnitCost > 0) {
       setValue('unitCost', calculatedUnitCost, { shouldValidate: true });
    }
  }, [calculatedUnitCost, setValue]);

  useEffect(() => {
    if (editingIngredient) {
      form.reset(editingIngredient);
    } else {
      form.reset({
        name: '',
        packageSize: 0,
        cost: 0,
        supplier: '',
        category: '',
        unitCost: undefined,
        lossFactor: undefined,
        stockQuantity: 0,
        lowStockThreshold: 0,
        expirationDate: undefined,
      });
    }
  }, [editingIngredient, form]);

  const handleFormSubmit = (values: IngredientFormValues) => {
    const ingredientData = {
      id: editingIngredient?.id,
      ...values,
      unitCost: calculatedUnitCost > 0 ? calculatedUnitCost : values.unitCost,
    };
    onSubmit(ingredientData);
    form.reset({
      name: '',
      packageSize: 0,
      cost: 0,
      supplier: '',
      category: '',
      unitCost: undefined,
      lossFactor: undefined,
      stockQuantity: 0,
      lowStockThreshold: 0,
      expirationDate: undefined,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="col-span-1 md:col-span-2">
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
            name="category"
            render={({ field }) => (
              <FormItem className="col-span-1 md:col-span-2">
                <FormLabel>Categoria</FormLabel>
                <FormControl>
                  <Input placeholder="(Opcional)" {...field} />
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
                <FormLabel>Volume Bruto</FormLabel>
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
                <FormLabel>Un.Med</FormLabel>
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
                <FormLabel>Custo Médio (R$)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="Ex: 5.50" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="unitCost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Custo Un. (R$)</FormLabel>
                <FormControl>
                   <Input 
                    type="number" 
                    readOnly 
                    disabled 
                    className="bg-muted/50"
                    placeholder="Auto" 
                    {...field} 
                    value={field.value?.toFixed(4) || ''}
                    />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="lossFactor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fator de Perda</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="Ex: 1.05" {...field} />
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
           <FormField
            control={control}
            name="stockQuantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Qtd. em Estoque</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Ex: 500" {...field} value={field.value ?? ''}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="lowStockThreshold"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alerta de Estoque Baixo</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Ex: 100" {...field} value={field.value ?? ''}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Controller
              name="expirationDate"
              control={control}
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data de Vencimento</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(new Date(field.value), "PPP")
                          ) : (
                            <span>Selecione a data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => field.onChange(date?.toISOString())}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>
        <div className="flex justify-end space-x-2 pt-2">
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
