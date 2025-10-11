
"use client";

import { useState, useMemo } from 'react';
import type { Ingredient, Recipe, RecipeItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BookMarked, Plus, Trash2 } from 'lucide-react';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';

interface RecipeBuilderProps {
  ingredients: Ingredient[];
  recipeItems: RecipeItem[];
  setRecipeItems: React.Dispatch<React.SetStateAction<RecipeItem[]>>;
  onSaveRecipe: (recipe: Omit<Recipe, 'id'>) => void;
}

const RecipeBuilder = ({ ingredients, recipeItems, setRecipeItems, onSaveRecipe }: RecipeBuilderProps) => {
  const [selectedIngredientId, setSelectedIngredientId] = useState<string | undefined>();
  const [quantity, setQuantity] = useState<number>(0);
  const [margin, setMargin] = useState<number>(100);
  const [marginType, setMarginType] = useState<'percentage' | 'fixed'>('percentage');
  const [recipeName, setRecipeName] = useState('');
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);


  const selectedIngredient = useMemo(() => ingredients.find((i) => i.id === selectedIngredientId), [selectedIngredientId, ingredients]);

  const addIngredient = () => {
    if (selectedIngredient && quantity > 0) {
      const cost = (selectedIngredient.unitCost || 0) * quantity;
      const newItem: RecipeItem = {
        id: new Date().toISOString(),
        name: selectedIngredient.name,
        quantity,
        unit: selectedIngredient.unit,
        cost: cost,
        ingredient: selectedIngredient,
      };
      setRecipeItems((prev) => [...prev, newItem]);
      setSelectedIngredientId(undefined);
      setQuantity(0);
    }
  };

  const removeIngredient = (id: string) => {
    setRecipeItems((prev) => prev.filter((ri) => ri.id !== id));
  };
  
  const totalCost = useMemo(() => {
    return recipeItems.reduce((acc, item) => acc + item.cost, 0);
  }, [recipeItems]);

  const suggestedPrice = useMemo(() => {
    if (totalCost === 0) return 0;
    if (marginType === 'percentage') {
      return totalCost * (1 + margin / 100);
    }
    return totalCost + margin;
  }, [totalCost, margin, marginType]);

  const handleSave = () => {
    if (!recipeName.trim() || recipeItems.length === 0) return;

    onSaveRecipe({
      name: recipeName,
      items: recipeItems,
      totalCost,
      suggestedPrice,
    });
    // Reset state after saving
    setRecipeItems([]);
    setRecipeName('');
    setIsSaveDialogOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Montagem da Receita</CardTitle>
        <CardDescription>
          Adicione ingredientes da sua lista para montar uma receita e calcular os custos.
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
              value={quantity === 0 ? '' : quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              placeholder="Ex: 250"
              className="w-full"
            />
          </div>
          <Button onClick={addIngredient} disabled={!selectedIngredientId || quantity <= 0} className="w-full md:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Adicionar
          </Button>
        </div>

        {recipeItems.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ingrediente</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead className="text-right">Custo</TableHead>
                  <TableHead className="text-right w-[50px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recipeItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.quantity} {item.unit}</TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.cost)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => removeIngredient(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
      {recipeItems.length > 0 && (
        <CardFooter className="flex flex-col items-start space-y-4">
          <Separator />
          <div className="w-full space-y-4 pt-4">
            <h3 className="text-lg font-semibold">Definir Preço de Venda</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div className="space-y-2">
                <Label>Margem de Lucro</Label>
                <Input 
                  type="number" 
                  value={margin === 0 ? '' : margin} 
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
            <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalCost)}</span>
          </div>
          <div className="w-full flex justify-between items-center text-xl font-bold p-4 bg-primary/10 rounded-lg">
            <span>Preço de Venda Sugerido:</span>
            <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(suggestedPrice)}</span>
          </div>
          <div className="w-full flex justify-end pt-2">
            <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
              <DialogTrigger asChild>
              <Button disabled={recipeItems.length === 0}>
                <BookMarked className="mr-2"/>
                Salvar Receita
              </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Salvar Nova Receita</DialogTitle>
                  <DialogDescription>Dê um nome para sua receita para salvá-la no seu Livro de Receitas.</DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                  <Label htmlFor="recipeName">Nome da Receita</Label>
                  <Input 
                    id="recipeName"
                    value={recipeName}
                    onChange={(e) => setRecipeName(e.target.value)}
                    placeholder="Ex: Bolo de Chocolate"
                  />
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancelar</Button>
                  </DialogClose>
                  <Button onClick={handleSave} disabled={!recipeName.trim()}>Salvar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default RecipeBuilder;
