"use client";

import { useEffect, useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { FileDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { importFromSheet } from '@/app/actions';
import type { Ingredient } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface ImportSheetDialogProps {
    onIngredientsImported: (ingredients: Ingredient[]) => void;
}

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
      Importar
    </Button>
  );
}

const ImportSheetDialog = ({ onIngredientsImported }: ImportSheetDialogProps) => {
  const [state, formAction, isPending] = useActionState(importFromSheet, initialState);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (state.success && state.data) {
        onIngredientsImported(state.data);
        setIsOpen(false);
    } else if (state.error) {
        toast({
            variant: "destructive",
            title: "Erro na Importação",
            description: state.error,
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileDown className="mr-2" />
          Importar do Google Sheets
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Importar Ingredientes do Google Sheets</DialogTitle>
          <DialogDescription>
            Cole o link da sua planilha. As colunas obrigatórias são: 
            <code className="font-mono text-sm bg-muted p-1 rounded-sm">Item</code>,
            <code className="font-mono text-sm bg-muted p-1 rounded-sm">Volume Bruto</code>,
            <code className="font-mono text-sm bg-muted p-1 rounded-sm">Un.Med</code>, e
            <code className="font-mono text-sm bg-muted p-1 rounded-sm">Custo Médio</code>.
            Colunas opcionais: <code className="font-mono text-sm bg-muted p-1 rounded-sm">Categoria</code>, <code className="font-mono text-sm bg-muted p-1 rounded-sm">Custo Un.</code>, <code className="font-mono text-sm bg-muted p-1 rounded-sm">Fator de perda</code>.
            A verificação não diferencia maiúsculas/minúsculas ou acentos.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sheetUrl">URL da Planilha</Label>
            <Input 
              id="sheetUrl" 
              name="sheetUrl" 
              placeholder="https://docs.google.com/spreadsheets/d/..." 
              required
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="secondary">
                    Cancelar
                </Button>
            </DialogClose>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ImportSheetDialog;
