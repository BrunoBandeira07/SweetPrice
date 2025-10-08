

"use client";

import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useUser, useFirestore, useMemoFirebase } from "@/firebase/provider";
import { collection, doc, query, where } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Archive, CalendarIcon, Plus, Minus, AlertCircle, CheckCircle } from 'lucide-react';
import type { Ingredient } from '@/lib/types';
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
import { Skeleton } from '@/components/ui/skeleton';

export default function StockPage() {
  const [filter, setFilter] = useState('');
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const ingredientsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'ingredients'), where('userId', '==', user.uid));
  }, [firestore, user]);
  const { data: ingredients = [], isLoading: isLoadingIngredients } = useCollection<Ingredient>(ingredientsQuery);

  const handleStockChange = (ingredient: Ingredient, amount: number) => {
    if (!firestore) return;
    const newQuantity = Math.max(0, (ingredient.stockQuantity || 0) + amount);
    const docRef = doc(firestore, 'ingredients', ingredient.id);
    setDocumentNonBlocking(docRef, { ...ingredient, stockQuantity: newQuantity }, { merge: true });
    toast({
        title: "Estoque Atualizado!",
        description: `O estoque de ${ingredient.name} foi ajustado.`
    })
  };

  const handleDateChange = (ingredient: Ingredient, date: Date | undefined) => {
    if (!firestore) return;
    const docRef = doc(firestore, 'ingredients', ingredient.id);
    setDocumentNonBlocking(docRef, { ...ingredient, expirationDate: date?.toISOString() }, { merge: true });
  };

  const filteredIngredients = ingredients.filter(ing =>
    ing.name.toLowerCase().includes(filter.toLowerCase())
  );
  
  const getStatus = (ingredient: Ingredient) => {
    const { stockQuantity = 0, lowStockThreshold = 0, expirationDate } = ingredient;
    const now = new Date();
    const expiry = expirationDate ? new Date(expirationDate) : null;
    const sevenDaysFromNow = new Date(new Date().setDate(new Date().getDate() + 7));
    
    if (expiry && expiry < new Date()) return { label: 'Vencido', color: 'destructive', icon: AlertCircle };
    if (stockQuantity <= 0) return { label: 'Sem Estoque', color: 'destructive', icon: AlertCircle };
    if (lowStockThreshold > 0 && stockQuantity <= lowStockThreshold) return { label: 'Estoque Baixo', color: 'accent', icon: AlertCircle };
    if (expiry && expiry <= sevenDaysFromNow) return { label: 'Vence em Breve', color: 'accent', icon: AlertCircle };

    return { label: 'Em Estoque', color: 'default', icon: CheckCircle };
  }
  
  const StockMovementDialog = ({ ingredient, type }: { ingredient: Ingredient, type: 'in' | 'out' }) => {
    const [amount, setAmount] = useState(0);

    const handleSubmit = () => {
        handleStockChange(ingredient, type === 'in' ? amount : -amount);
    }
    
    return (
        <Dialog onOpenChange={(open) => !open && setAmount(0)}>
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
                    <Input id="amount" type="number" value={amount === 0 ? '' : amount} onChange={(e) => setAmount(Number(e.target.value))} />
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="secondary">Cancelar</Button>
                    </DialogClose>
                     <DialogClose asChild>
                        <Button onClick={handleSubmit} disabled={amount <= 0}>Confirmar</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
  }


  return (
    <div className="w-full">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Archive/>
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
                  {isLoadingIngredients ? (
                     [...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                           <TableCell colSpan={5}>
                              <Skeleton className="h-8 w-full"/>
                           </TableCell>
                        </TableRow>
                     ))
                  ) : filteredIngredients.map(ingredient => {
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
                                    onSelect={(date) => handleDateChange(ingredient, date)}
                                    initialFocus
                                    />
                                </PopoverContent>
                                </Popover>
                            </TableCell>
                            <TableCell>
                                <Badge 
                                    variant={status.color as any} 
                                    className={cn('flex items-center gap-1 w-fit', {
                                        'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700': status.color === 'destructive',
                                        'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700': status.color === 'accent',
                                        'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700': status.color === 'default',
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
            {!isLoadingIngredients && filteredIngredients.length === 0 && (
                <div className="text-center py-16">
                    <p className="text-muted-foreground">Nenhum ingrediente encontrado.</p>
                </div>
            )}
          </CardContent>
        </Card>
    </div>
  );
}

    