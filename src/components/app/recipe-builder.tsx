
"use client";

import { useState, useMemo, useEffect } from 'react';
import type { Ingredient, Recipe, RecipeItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BookMarked, Plus, Trash2, BookUp, CookingPot, Clock, Zap, Eraser, Sparkles } from 'lucide-react';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import SubstitutionFinder from './substitution-finder';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCosts } from '@/hooks/use-costs';

interface RecipeBuilderProps {
  ingredients: Ingredient[];
  recipeItems: RecipeItem[];
  setRecipeItems: React.Dispatch<React.SetStateAction<RecipeItem[]>>;
  onSaveRecipe: (recipe: Omit<Recipe, 'id' | 'userId' | 'items'> & { id?: string; items: RecipeItem[] }) => void;
  onClearRecipe: () => void;
  editingRecipe?: Recipe;
}

const RecipeBuilder = ({ ingredients, recipeItems, setRecipeItems, onSaveRecipe, onClearRecipe, editingRecipe }: RecipeBuilderProps) => {
  const { costs, electricEquipments, gasEquipments } = useCosts();

  // Ingredient state
  const [selectedIngredientId, setSelectedIngredientId] = useState<string | undefined>();
  const [ingredientQuantity, setIngredientQuantity] = useState<number>(0);

  // Labor state
  const [laborTime, setLaborTime] = useState<number>(0);
  
  // Equipment state
  const [selectedEquipmentKey, setSelectedEquipmentKey] = useState<string | undefined>();
  const [equipmentTime, setEquipmentTime] = useState<number>(0);

  // General state
  const [margin, setMargin] = useState<number>(100);
  const [marginType, setMarginType] = useState<'percentage' | 'fixed'>('percentage');
  const [recipeName, setRecipeName] = useState('');
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);

  // Computed values
  const selectedIngredient = useMemo(() => ingredients.find((i) => i.id === selectedIngredientId), [selectedIngredientId, ingredients]);
  const allEquipments = useMemo(() => ({ ...electricEquipments, ...gasEquipments }), [electricEquipments, gasEquipments]);

  const selectedEquipment = useMemo(() => {
    if (!selectedEquipmentKey) return null;
    const equip = allEquipments[selectedEquipmentKey as keyof typeof allEquipments];
    return equip ? { key: selectedEquipmentKey, ...equip } : null;
  }, [selectedEquipmentKey, allEquipments]);

  useEffect(() => {
    if (editingRecipe) {
        setRecipeName(editingRecipe.name);
        const marginValue = editingRecipe.margin;
        const type = editingRecipe.marginType;
        if (marginValue !== undefined && type) {
            setMargin(marginValue);
            setMarginType(type);
        } else {
            // Default values if not present
            setMargin(100);
            setMarginType('percentage');
        }
    } else {
        setRecipeName('');
        setMargin(100);
        setMarginType('percentage');
    }
  }, [editingRecipe]);

  const addRecipeItem = (type: 'ingredient' | 'labor' | 'equipment') => {
    let newItem: RecipeItem | null = null;

    if (type === 'ingredient' && selectedIngredient && ingredientQuantity > 0) {
      const cost = (selectedIngredient.unitCost || 0) * ingredientQuantity * (selectedIngredient.lossFactor || 1);
      newItem = {
        id: new Date().toISOString(),
        type: 'ingredient',
        name: selectedIngredient.name,
        quantity: ingredientQuantity,
        unit: selectedIngredient.unit,
        cost: cost,
        ingredient: selectedIngredient,
      };
      setSelectedIngredientId(undefined);
      setIngredientQuantity(0);
    } 
    else if (type === 'labor' && laborTime > 0) {
        const proLaborePerHour = (costs.proLabore || 0) / (22 * 8); // Assuming 22 work days, 8 hours/day
        const costPerMinute = proLaborePerHour / 60;
        const cost = costPerMinute * laborTime;
        newItem = {
            id: new Date().toISOString(),
            type: 'labor',
            name: 'Mão de Obra',
            quantity: laborTime,
            unit: 'min',
            cost,
        }
        setLaborTime(0);
    }
    else if (type === 'equipment' && selectedEquipment && equipmentTime > 0) {
      let cost = 0;
      const timeInHours = equipmentTime / 60;
      
      if (selectedEquipment.unit === 'Watts' && costs.kwhPrice) { // Electric
        const powerInKw = selectedEquipment.value / 1000;
        cost = powerInKw * timeInHours * costs.kwhPrice;
      } else if (selectedEquipment.unit === 'kg/h' && costs.gasCylinderPrice && costs.gasCylinderSize) { // Gas
        const gasPricePerKg = costs.gasCylinderPrice / parseFloat(costs.gasCylinderSize);
        const gasConsumedKg = selectedEquipment.value * timeInHours;
        cost = gasConsumedKg * gasPricePerKg;
      }

      newItem = {
        id: new Date().toISOString(),
        type: 'equipment',
        name: selectedEquipment.label,
        quantity: equipmentTime,
        unit: 'min',
        cost,
        equipmentKey: selectedEquipment.key,
      }
      setSelectedEquipmentKey(undefined);
      setEquipmentTime(0);
    }

    if (newItem) {
      setRecipeItems((prev) => [...prev, newItem!]);
    }
  };


  const removeRecipeItem = (id: string) => {
    setRecipeItems((prev) => prev.filter((ri) => ri.id !== id));
  };
  
  const totalCost = useMemo(() => {
    return recipeItems.reduce((acc, item) => acc + item.cost, 0);
  }, [recipeItems]);

  const suggestedPrice = useMemo(() => {
    if (totalCost === 0) return 0;
    
    // Add indirect costs and taxes before profit margin
    const costWithIndirects = totalCost * (1 + (costs.indirectCostsRate || 0) / 100);
    const costWithTaxes = costWithIndirects / (1 - ((costs.taxRate || 0) + (costs.creditCardFee || 0)) / 100);

    if (marginType === 'percentage') {
      return costWithTaxes * (1 + margin / 100);
    }
    return costWithTaxes + margin;
  }, [totalCost, margin, marginType, costs]);


  const handleSave = () => {
    if (!recipeName.trim() || recipeItems.length === 0) return;

    onSaveRecipe({
      id: editingRecipe?.id,
      name: recipeName,
      items: recipeItems,
      totalCost,
      suggestedPrice,
      margin,
      marginType,
    });
    setRecipeName('');
    setIsSaveDialogOpen(false);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-start flex-wrap gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="text-primary"/>
              {editingRecipe ? "Editando Receita" : "Calculadora de Receita"}
            </CardTitle>
            <CardDescription>
              {editingRecipe ? `Modificando "${editingRecipe.name}"` : "Crie uma nova receita e calcule seu preço."}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
             <Button variant="ghost" size="sm" onClick={onClearRecipe} disabled={recipeItems.length === 0 && !editingRecipe}>
                <Eraser className="mr-2"/>
                Limpar
            </Button>
            <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
                <DialogTrigger asChild>
                <Button variant="outline" disabled={recipeItems.length === 0}>
                    <BookUp className="mr-2"/>
                    Salvar Receita
                </Button>
                </DialogTrigger>
                <DialogContent>
                <DialogHeader>
                    <DialogTitle>{editingRecipe ? "Atualizar Receita" : "Salvar Nova Receita"}</DialogTitle>
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
                    <Button onClick={handleSave} disabled={!recipeName.trim()}>{editingRecipe ? "Atualizar" : "Salvar"}</Button>
                </DialogFooter>
                </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="ingredients">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ingredients"><CookingPot className="mr-2"/>Ingredientes</TabsTrigger>
            <TabsTrigger value="labor"><Clock className="mr-2"/>Mão de Obra</TabsTrigger>
            <TabsTrigger value="equipment"><Zap className="mr-2"/>Equipamentos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="ingredients" className="pt-4">
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
                  value={ingredientQuantity === 0 ? '' : ingredientQuantity}
                  onChange={(e) => setIngredientQuantity(Number(e.target.value))}
                  placeholder="Ex: 250"
                  className="w-full"
                />
              </div>
              <Button onClick={() => addRecipeItem('ingredient')} disabled={!selectedIngredientId || ingredientQuantity <= 0} className="w-full md:w-auto">
                <Plus className="mr-2 h-4 w-4" /> Adicionar
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="labor" className="pt-4">
              <div className="flex flex-col md:flex-row items-end gap-2">
                 <div className="flex-grow w-full">
                    <Label>Tempo Gasto (minutos)</Label>
                    <Input
                    type="number"
                    value={laborTime === 0 ? '' : laborTime}
                    onChange={(e) => setLaborTime(Number(e.target.value))}
                    placeholder="Ex: 60"
                    />
                 </div>
                 <Button onClick={() => addRecipeItem('labor')} disabled={laborTime <= 0} className="w-full md:w-auto">
                    <Plus className="mr-2 h-4 w-4" /> Adicionar Mão de Obra
                 </Button>
              </div>
          </TabsContent>

          <TabsContent value="equipment" className="pt-4">
              <div className="flex flex-col md:flex-row items-end gap-2">
                <div className="flex-grow w-full">
                    <Label>Equipamento</Label>
                    <Select onValueChange={setSelectedEquipmentKey} value={selectedEquipmentKey}>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecione um equipamento" />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.entries(allEquipments).map(([key, equip]) => (
                            equip.value && <SelectItem key={key} value={key}>{equip.label}</SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                </div>
                <div className="w-full md:w-auto">
                    <Label>Tempo de Uso (minutos)</Label>
                    <Input
                        type="number"
                        value={equipmentTime === 0 ? '' : equipmentTime}
                        onChange={(e) => setEquipmentTime(Number(e.target.value))}
                        placeholder="Ex: 15"
                        className="w-full"
                    />
                </div>
                <Button onClick={() => addRecipeItem('equipment')} disabled={!selectedEquipmentKey || equipmentTime <= 0} className="w-full md:w-auto">
                    <Plus className="mr-2 h-4 w-4" /> Adicionar Equipamento
                </Button>
              </div>
          </TabsContent>
        </Tabs>


        {recipeItems.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead className="text-right">Custo</TableHead>
                  <TableHead className="text-center w-[100px]">Ações</TableHead>
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
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center space-x-1">
                        {item.type === 'ingredient' && item.ingredient && <SubstitutionFinder ingredient={item.ingredient} amount={item.quantity} />}
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => removeRecipeItem(item.id)}>
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
            <div className="w-full flex justify-between items-center text-xl font-bold p-4 bg-accent/30 rounded-lg">
            <span>Preço de Venda Sugerido:</span>
            <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(suggestedPrice)}</span>
            </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default RecipeBuilder;
