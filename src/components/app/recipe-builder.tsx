
"use client";

import { useState, useMemo, useEffect } from 'react';
import type { Ingredient, Recipe, RecipeItem, RecipeItemType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BookMarked, Plus, Trash2, Zap, Clock, Package } from 'lucide-react';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { useCosts } from '@/hooks/use-costs';


interface RecipeBuilderProps {
  ingredients: Ingredient[];
  recipeItems: RecipeItem[];
  setRecipeItems: React.Dispatch<React.SetStateAction<RecipeItem[]>>;
  onSaveRecipe: (recipe: Omit<Recipe, 'id' | 'userId'>) => void;
  initialState?: { name: string; margin: number; marginType: 'percentage' | 'fixed' };
}

const RecipeBuilder = ({ ingredients, recipeItems, setRecipeItems, onSaveRecipe, initialState }: RecipeBuilderProps) => {
  const { costs, electricEquipments, gasEquipments } = useCosts();
  
  const [itemType, setItemType] = useState<RecipeItemType>('ingredient');
  const [selectedIngredientId, setSelectedIngredientId] = useState<string | undefined>();
  const [selectedEquipment, setSelectedEquipment] = useState<string | undefined>();
  const [quantity, setQuantity] = useState<number>(0);
  const [time, setTime] = useState<number>(0);

  const [margin, setMargin] = useState<number>(initialState?.margin || 100);
  const [marginType, setMarginType] = useState<'percentage' | 'fixed'>(initialState?.marginType || 'percentage');
  const [recipeName, setRecipeName] = useState(initialState?.name || '');
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);

  useEffect(() => {
    if (initialState) {
        setRecipeName(initialState.name);
        setMargin(initialState.margin);
        setMarginType(initialState.marginType);
    }
  }, [initialState]);

  const selectedIngredient = useMemo(() => ingredients.find((i) => i.id === selectedIngredientId), [selectedIngredientId, ingredients]);
  const allEquipments = useMemo(() => ({...electricEquipments, ...gasEquipments}), [electricEquipments, gasEquipments]);

  const resetInputs = () => {
    setSelectedIngredientId(undefined);
    setSelectedEquipment(undefined);
    setQuantity(0);
    setTime(0);
  }

  const addItem = () => {
    let newItem: RecipeItem | null = null;
    const id = new Date().toISOString();

    switch (itemType) {
        case 'ingredient':
            if (selectedIngredient && quantity > 0) {
                const cost = (selectedIngredient.unitCost || 0) * quantity;
                newItem = { id, type: 'ingredient', name: selectedIngredient.name, quantity, unit: selectedIngredient.unit, cost, ingredient: selectedIngredient };
            }
            break;
        case 'labor':
             if (time > 0 && costs.proLabore) {
                const hourlyRate = costs.proLabore / (4 * 40); // 4 weeks * 40 hours/week
                const cost = (hourlyRate / 60) * time; // Cost per minute
                newItem = { id, type: 'labor', name: 'Mão de Obra', quantity: time, unit: 'min', cost };
            }
            break;
        case 'equipment':
            if (selectedEquipment && time > 0 && allEquipments[selectedEquipment]) {
                const equipment = allEquipments[selectedEquipment];
                let cost = 0;
                if (equipment.unit === 'Watts' && costs.kwhPrice && equipment.value) {
                    cost = (equipment.value / 1000) * (time / 60) * costs.kwhPrice; // Kwh * time in hours * price per kwh
                } else if (equipment.unit === 'kg/h' && costs.gasCylinderPrice && costs.gasCylinderSize && equipment.value) {
                    const gasPricePerKg = costs.gasCylinderPrice / Number(costs.gasCylinderSize);
                    cost = equipment.value * (time / 60) * gasPricePerKg;
                }
                newItem = { id, type: 'equipment', name: equipment.label, quantity: time, unit: 'min', cost };
            }
            break;
    }

    if (newItem) {
      setRecipeItems((prev) => [...prev, newItem]);
      resetInputs();
    }
  };

  const removeItem = (id: string) => {
    setRecipeItems((prev) => prev.filter((ri) => ri.id !== id));
  };
  
  const totalCost = useMemo(() => {
    return recipeItems.reduce((acc, item) => acc + item.cost, 0);
  }, [recipeItems]);

  const suggestedPrice = useMemo(() => {
    if (totalCost === 0) return 0;
    
    // Add indirect costs and taxes before applying margin
    const costWithIndirects = totalCost * (1 + (costs.indirectCostsRate || 0) / 100);
    const costWithTaxes = costWithIndirects / (1 - (costs.taxRate || 0) / 100);
    
    let finalPrice;
    if (marginType === 'percentage') {
      finalPrice = costWithTaxes * (1 + margin / 100);
    } else {
      finalPrice = costWithTaxes + margin;
    }

    // Add credit card fee
    const finalPriceWithFee = finalPrice / (1 - (costs.creditCardFee || 0) / 100);
    
    return finalPriceWithFee;

  }, [totalCost, margin, marginType, costs]);

  const handleSave = () => {
    if (!recipeName.trim() || recipeItems.length === 0) return;

    onSaveRecipe({
      name: recipeName,
      items: recipeItems,
      totalCost,
      suggestedPrice,
      margin,
      marginType,
    });
    // Reset state after saving
    setIsSaveDialogOpen(false);
  };

  const renderInputs = () => {
    switch (itemType) {
        case 'ingredient':
            return <>
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
            </>
        case 'labor':
            return <div className="w-full">
                <Label>Tempo Gasto (minutos)</Label>
                <Input type="number" value={time === 0 ? '' : time} onChange={(e) => setTime(Number(e.target.value))} placeholder="Ex: 60" />
                {!costs.proLabore && <p className="text-xs text-destructive mt-1">Defina seu Pró-labore na página de Custos.</p>}
            </div>
        case 'equipment':
            return <>
                <div className="flex-grow w-full">
                    <Label>Equipamento</Label>
                     <Select onValueChange={setSelectedEquipment} value={selectedEquipment}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione um equipamento" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(allEquipments).map(([key, eq]) => eq.value && (
                                <SelectItem key={key} value={key}>{eq.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="w-full md:w-auto">
                    <Label>Tempo de Uso (minutos)</Label>
                    <Input type="number" value={time === 0 ? '' : time} onChange={(e) => setTime(Number(e.target.value))} placeholder="Ex: 15" />
                </div>
            </>
        default: return null;
    }
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle>Montagem da Receita</CardTitle>
        <CardDescription>
          Adicione ingredientes, mão de obra e custos de equipamento para montar sua receita.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-2 rounded-lg bg-muted p-1">
             <Button variant={itemType === 'ingredient' ? 'primary' : 'ghost'} onClick={() => setItemType('ingredient')} className="flex-grow"><Package className="mr-2"/>Ingrediente</Button>
             <Button variant={itemType === 'labor' ? 'primary' : 'ghost'} onClick={() => setItemType('labor')} className="flex-grow"><Clock className="mr-2"/>Mão de Obra</Button>
             <Button variant={itemType === 'equipment' ? 'primary' : 'ghost'} onClick={() => setItemType('equipment')} className="flex-grow"><Zap className="mr-2"/>Equipamento</Button>
        </div>

        <div className="flex flex-col md:flex-row items-end gap-2">
            {renderInputs()}
            <Button onClick={addItem} className="w-full md:w-auto">
                <Plus className="mr-2 h-4 w-4" /> Adicionar
            </Button>
        </div>

        {recipeItems.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
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
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => removeItem(item.id)}>
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
            <p className="text-sm text-muted-foreground/80">Adicione itens para começar a montar.</p>
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
           <p className="text-xs text-muted-foreground">O custo total inclui o rateio de custos indiretos e impostos definidos na página de Custos.</p>
          <div className="w-full flex justify-between items-center text-xl font-bold p-4 bg-primary/10 rounded-lg">
            <span>Preço de Venda Sugerido:</span>
            <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(suggestedPrice)}</span>
          </div>
           <p className="text-xs text-muted-foreground">O preço de venda inclui a taxa de cartão de crédito definida na página de Custos.</p>
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
                  <DialogTitle>Salvar Receita</DialogTitle>
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

    