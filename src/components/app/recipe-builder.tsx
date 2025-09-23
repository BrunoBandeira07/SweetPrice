"use client";

import { useState, useMemo } from 'react';
import type { Ingredient, RecipeIngredient } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BookMarked, Plus, Trash2, HelpCircle } from 'lucide-react';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import SubstitutionFinder from './substitution-finder';

interface RecipeBuilderProps {
  ingredients: Ingredient[];
  recipeIngredients: RecipeIngredient[];
  setRecipeIngredients: React.Dispatch<React.SetStateAction<RecipeIngredient[]>>;
}

const RecipeBuilder = ({ ingredients, recipeIngredients, setRecipeIngredients }: RecipeBuilderProps) => {
  const [selectedIngredientId, setSelectedIngredientId] = useState<string | undefined>();
  const [quantity, setQuantity] = useState<number>(0);

  const [margin, setMargin] = useState<number>(100);
  const [marginType, setMarginType] = useState<'percentage' | 'fixed'>('percentage');

  const addIngredientToRecipe = () => {
    if (!selectedIngredientId || quantity <= 0) return;
    
    const ingredient = ingredients.find((i) => i.id === selectedIngredientId);
    if (!ingredient) return;

    const newRecipeIngredient: RecipeIngredient = {
      id: new Date().toISOString(),
      ingredient,
      quantity,
    };

    setRecipeIngredients((prev) => [...prev, newRecipeIngredient]);
    setSelectedIngredientId(undefined);
    setQuantity(0);
  };

  const removeIngredientFromRecipe = (id: string) => {
    setRecipeIngredients((prev) => prev.filter((ri) => ri.id !== id));
  };
  
  const totalCost = useMemo(() => {
    return recipeIngredients.reduce((acc, ri) => {
      const costPerUnit = ri.ingredient.cost / ri.ingredient.packageSize;
      return acc + (costPerUnit * ri.quantity);
    }, 0);
  }, [recipeIngredients]);

  const suggestedPrice = useMemo(() => {
    if (totalCost === 0) return 0;
    if (marginType === 'percentage') {
      return totalCost * (1 + margin / 100);
    }
    return totalCost + margin;
  }, [totalCost, margin, marginType]);

  const selectedIngredient = useMemo(() => ingredients.find((i) => i.id === selectedIngredientId), [selectedIngredientId, ingredients]);


  return (
    <Card className="shadow-lg h-full">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
          <BookMarked className="text-primary"/>
          Montar Receita
        </CardTitle>
        <CardDescription>
          Adicione ingredientes da sua lista para montar uma nova receita e calcular seu custo.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col md:flex-row items-end gap-2">
          <div className="flex-grow w-full">
            <Label>Ingrediente</Label>
            <Select onValueChange={setSelectedIngredientId} value={selectedIngredientId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um ingrediente" />
              </SelectTrigger>
              <SelectContent>
                {ingredients.map((ing) => (
                  <SelectItem key={ing.id} value={ing.id}>
                    {ing.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full md:w-auto">
            <Label>Quantidade ({selectedIngredient?.unit})</Label>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              placeholder="Ex: 250"
              className="w-full"
            />
          </div>
          <Button onClick={addIngredientToRecipe} disabled={!selectedIngredientId || quantity <= 0}>
            <Plus className="mr-2 h-4 w-4" /> Adicionar
          </Button>
        </div>

        {recipeIngredients.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ingrediente</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead className="text-right">Custo</TableHead>
                  <TableHead className="text-center w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recipeIngredients.map((ri) => (
                  <TableRow key={ri.id}>
                    <TableCell className="font-medium">{ri.ingredient.name}</TableCell>
                    <TableCell>{ri.quantity} {ri.ingredient.unit}</TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                        (ri.ingredient.cost / ri.ingredient.packageSize) * ri.quantity
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <SubstitutionFinder ingredient={ri.ingredient} amount={ri.quantity} />
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => removeIngredientFromRecipe(ri.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">Sua receita está vazia.</p>
            <p className="text-sm text-muted-foreground/80">Adicione ingredientes para começar a montar.</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-start space-y-4">
        <Separator />
         <div className="w-full space-y-4 pt-4">
          <h3 className="text-lg font-semibold font-headline">Definir Preço de Venda</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="space-y-2">
              <Label>Margem de Lucro</Label>
              <Input 
                type="number" 
                value={margin} 
                onChange={(e) => setMargin(Number(e.target.value))}
              />
            </div>
            <RadioGroup defaultValue="percentage" value={marginType} onValueChange={(value: 'percentage' | 'fixed') => setMarginType(value)} className="pt-6">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="percentage" id="percentage" />
                <Label htmlFor="percentage">Percentual (%)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fixed" id="fixed" />
                <Label htmlFor="fixed">Valor Fixo (R$)</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        <Separator />
        <div className="w-full flex justify-between items-center text-lg font-bold pt-4">
          <span>Custo Total da Receita:</span>
          <span className="text-primary">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalCost)}</span>
        </div>
        <div className="w-full flex justify-between items-center text-xl font-bold p-4 bg-accent/30 rounded-lg">
          <span className="text-accent-foreground">Preço de Venda Sugerido:</span>
          <span className="text-accent-foreground">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(suggestedPrice)}</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default RecipeBuilder;
