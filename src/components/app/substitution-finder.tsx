"use client";

import { useActionState, useFormStatus } from 'react-dom';
import { HelpCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getSubstitutions } from '@/app/actions';
import type { Ingredient } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Separator } from '../ui/separator';

const initialState = {
  success: false,
  data: undefined,
  error: undefined,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Encontrar Substitutos
    </Button>
  );
}

const SubstitutionFinder = ({ ingredient, amount }: { ingredient: Ingredient; amount: number }) => {
  const [state, formAction] = useActionState(getSubstitutions, initialState);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-primary hover:text-primary">
          <HelpCircle className="h-4 w-4" />
          <span className="sr-only">Encontrar Substitutos</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Encontrar Substitutos para {ingredient.name}</DialogTitle>
          <DialogDescription>
            Encontre ingredientes equivalentes em diferentes mercados. Isso pode ser útil para adaptar suas receitas.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="ingredientName" value={ingredient.name} />
          <input type="hidden" name="amount" value={amount} />
          <div>
            <Label htmlFor="market">Mercado (Opcional)</Label>
            <Input id="market" name="market" placeholder="Ex: US, UK, BR" />
          </div>
          <DialogFooter>
            <SubmitButton />
          </DialogFooter>
        </form>
        
        {state.error && (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

        {state.success && state.data && (
           <div className="mt-6 space-y-4">
            <Separator />
            <h3 className="font-semibold text-lg">Substituições Sugeridas</h3>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Ingrediente</TableHead>
                        <TableHead>Quantidade</TableHead>
                        <TableHead>Mercado</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {state.data.substitutions.map((sub, index) => (
                        <TableRow key={index}>
                            <TableCell>{sub.ingredientName}</TableCell>
                            <TableCell>{sub.amount.toFixed(2)}</TableCell>
                            <TableCell>{sub.market}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
           </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SubstitutionFinder;
