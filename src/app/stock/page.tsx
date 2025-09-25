"use client";

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import AppHeader from '@/components/app/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Archive, ArrowLeftRight, CalendarIcon, Plus, Minus, AlertCircle, CheckCircle } from 'lucide-react';
import type { Ingredient } from '@/lib/types';
import { INITIAL_INGREDIENTS } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';

export default function StockPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [filter, setFilter] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedIngredients = localStorage.getItem('ingredients');
      if (storedIngredients) {
        setIngredients(JSON.parse(storedIngredients));
      } else {
        setIngredients(INITIAL_INGREDIENTS);
      }
    } catch (error) {
      console.error("Failed to load ingredients from localStorage", error);
      setIngredients(INITIAL_INGREDIENTS);
    }
  }, []);

  const updateIngredients = (newIngredients: Ingredient[]) => {
    setIngredients(newIngredients);
    localStorage.setItem('ingredients', JSON.stringify(newIngredients));
  };

  const handleStockChange = (ingredientId: string, amount: number) => {
    const newIngredients = ingredients.map(ing => {
      if (ing.id === ingredientId) {
        return { ...ing, stockQuantity: Math.max(0, (ing.stockQuantity || 0) + amount) };
      }
      return ing;
    });
    updateIngredients(newIngredients);
    toast({
        title: "Estoque Atualizado!",
        description: `O estoque de ${newIngredients.find(i=> i.id === ingredientId)?.name} foi ajustado.`
    })
  };

  const handleDateChange = (ingredientId: string, date: Date | undefined) => {
    const newIngredients = ingredients.map(ing => {
      if (ing.id === ingredientId) {
        return { ...ing, expirationDate: date?.toISOString() };
      }
      return ing;
    });
    updateIngredients(newIngredients);
  };

  const filteredIngredients = ingredients.filter(ing =>
    ing.name.toLowerCase().includes(filter.toLowerCase())
  );
  
  const getStatus = (ingredient: Ingredient) => {
    const { stockQuantity = 0, lowStockThreshold = 0, expirationDate } = ingredient;
    const now = new Date();
    const expiry = expirationDate ? new Date(expirationDate) : null;
    const sevenDaysFromNow = new Date(now.setDate(now.getDate() + 7));
    
    if (expiry && expiry < new Date()) return { label: 'Vencido', color: 'destructive', icon: AlertCircle };
    if (stockQuantity <= 0) return { label: 'Sem Estoque', color: 'destructive', icon: AlertCircle };
    if (stockQuantity <= lowStockThreshold) return { label: 'Estoque Baixo', color: 'accent', icon: AlertCircle };
    if (expiry && expiry <= sevenDaysFromNow) return { label: 'Vence em Breve', color: 'accent', icon: AlertCircle };

    return { label: 'Em Estoque', color: 'default', icon: CheckCircle };
  }
  
  const StockMovementDialog = ({ ingredient, type }: { ingredient: Ingredient, type: 'in' | 'out' }) => {
    const [amount, setAmount] = useState(0);

    const handleSubmit = () => {
        handleStockChange(ingredient.id, type === 'in' ? amount : -amount);
    }
    
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant={type === 'in' ? 'outline' : 'destructive'} size="icon">
                    {type === 'in' ? <Plus/> : <Minus/>}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{type === 'in' ? 'Registrar Entrada' : 'Registrar Saída'} de {ingredient.name}</DialogTitle>
                    <DialogDescription>
                       Estoque atual: {ingredient.stockQuantity || 0} {ingredient.unit}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                    <label htmlFor="amount">Quantidade ({ingredient.unit})</label>
                    <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="secondary">Cancelar</Button>
                    </DialogClose>
                     <DialogClose asChild>
                        <Button onClick={handleSubmit}>Confirmar</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
  }


  return (
    <div className="min-h-screen w-full">
      <AppHeader />
      <main className="container mx-auto p-4 md:p-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center gap-3">
              <Archive className="text-primary" />
              Controle de Estoque
            </CardTitle>
            <CardDescription>
              Gerencie a quantidade e a validade dos seus ingredientes.
            </CardDescription>
            <div className="pt-4">
                 <Input 
                    placeholder="Filtrar por nome do ingrediente..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                 />
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ingrediente</TableHead>
                    <TableHead>Estoque Atual</TableHead>
                    <TableHead>Data de Vencimento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIngredients.map(ingredient => {
                     const status = getStatus(ingredient);
                     return (
                        <TableRow key={ingredient.id}>
                            <TableCell className="font-medium">{ingredient.name}</TableCell>
                            <TableCell>
                                <span className="font-mono">{ingredient.stockQuantity || 0} {ingredient.unit}</span>
                            </TableCell>
                            <TableCell>
                                <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-[200px] justify-start text-left font-normal",
                                        !ingredient.expirationDate && "text-muted-foreground"
                                    )}
                                    >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {ingredient.expirationDate
                                        ? format(new Date(ingredient.expirationDate), 'PPP', { locale: ptBR })
                                        : <span>Sem data</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                    mode="single"
                                    selected={ingredient.expirationDate ? new Date(ingredient.expirationDate) : undefined}
                                    onSelect={(date) => handleDateChange(ingredient.id, date)}
                                    initialFocus
                                    />
                                </PopoverContent>
                                </Popover>
                            </TableCell>
                            <TableCell>
                                <Badge 
                                    variant={status.color as any} 
                                    className={cn('flex items-center gap-1 w-fit', {
                                        'bg-red-100 text-red-800 border-red-300': status.color === 'destructive',
                                        'bg-yellow-100 text-yellow-800 border-yellow-300': status.color === 'accent',
                                        'bg-green-100 text-green-800 border-green-300': status.color === 'default',
                                    })}
                                >
                                    <status.icon className="h-3 w-3"/>
                                    {status.label}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <StockMovementDialog ingredient={ingredient} type="in" />
                                    <StockMovementDialog ingredient={ingredient} type="out" />
                                </div>
                            </TableCell>
                        </TableRow>
                     )
                  })}
                </TableBody>
              </Table>
            </div>
            {filteredIngredients.length === 0 && (
                <div className="text-center py-16">
                    <p className="text-muted-foreground">Nenhum ingrediente encontrado com este filtro.</p>
                </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
