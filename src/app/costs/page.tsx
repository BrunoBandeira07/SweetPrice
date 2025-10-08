
"use client";

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Settings, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUser, useFirestore, useMemoFirebase } from "@/firebase/provider";
import { useDoc } from '@/firebase/firestore/use-doc';
import { doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Skeleton } from '../ui/skeleton';
import { useFieldArray } from 'react-hook-form';

const customExpenseSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  value: z.coerce.number().positive('Valor deve ser positivo'),
  unit: z.string().min(1, 'Unidade é obrigatória'),
});

const costsFormSchema = z.object({
  kwhPrice: z.coerce.number().optional(),
  gasCylinderSize: z.enum(['8', '10', '13']).optional(),
  gasCylinderPrice: z.coerce.number().optional(),
  proLabore: z.coerce.number().optional(),
  creditCardFee: z.coerce.number().optional(),
  indirectCostsRate: z.coerce.number().optional(),
  taxRate: z.coerce.number().optional(),
  microwavePower: z.coerce.number().optional(),
  blenderPower: z.coerce.number().optional(),
  mixerPower: z.coerce.number().optional(),
  electricOvenPower: z.coerce.number().optional(),
  brigadeiroPanPower: z.coerce.number().optional(),
  fryerPower: z.coerce.number().optional(),
  gasFryerFlow: z.coerce.number().optional(),
  stoveBurnerFlow: z.coerce.number().optional(),
  gasOvenFlow: z.coerce.number().optional(),
  customExpenses: z.array(customExpenseSchema).optional(),
});

type CostsFormValues = z.infer<typeof costsFormSchema>;

const fieldLabels: Record<keyof Omit<CostsFormValues, 'customExpenses' | 'gasCylinderSize'>, { label: string, unit?: string, description?: string }> = {
    kwhPrice: { label: 'Energia elétrica', unit: 'R$/kWh', description: 'Preço por Kilowatt-hora da sua conta' },
    gasCylinderPrice: { label: 'Gás de cozinha', unit: 'R$', description: 'Preço total do botijão que você usa' },
    proLabore: { label: 'Pró labore', unit: 'R$', description: 'Seu salário mensal como dono(a) do negócio' },
    creditCardFee: { label: 'Taxa da maquineta no Crédito', unit: '%', description: 'Taxa média para vendas no crédito (1x)' },
    indirectCostsRate: { label: 'Custos Indiretos', unit: '%', description: 'Rateio de aluguel, água, internet, etc.' },
    taxRate: { label: 'Imposto (Simples Nacional)', unit: '%', description: 'Alíquota do seu regime de imposto' },
    microwavePower: { label: 'Potência do micro-ondas', unit: 'Watts', description: 'Veja na etiqueta do equipamento' },
    blenderPower: { label: 'Potência do liquidificador', unit: 'Watts', description: 'Veja na etiqueta do equipamento' },
    mixerPower: { label: 'Potência da batedeira', unit: 'Watts', description: 'Veja na etiqueta do equipamento' },
    electricOvenPower: { label: 'Potência do forno elétrico', unit: 'Watts', description: 'Veja na etiqueta do equipamento' },
    brigadeiroPanPower: { label: 'Potência da panela de mexer brigadeiro', unit: 'Watts', description: 'Veja na etiqueta do equipamento' },
    fryerPower: { label: 'Potência da fritadeira', unit: 'Watts', description: 'Veja na etiqueta do equipamento' },
    gasFryerFlow: { label: 'Vazão fritadeira a gás', unit: 'kg/h', description: 'Consumo de gás por hora do equipamento' },
    stoveBurnerFlow: { label: 'Vazão de uma boca do fogão', unit: 'kg/h', description: 'Consumo de gás por hora de uma boca' },
    gasOvenFlow: { label: 'Vazão do forno a gás', unit: 'kg/h', description: 'Consumo de gás por hora do forno' },
};


export default function CostsPage() {
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const costsDocRef = useMemoFirebase(() => user ? doc(firestore, 'costs', user.uid) : null, [firestore, user]);
  const { data: savedCosts, isLoading } = useDoc<CostsFormValues>(costsDocRef);
  
  const form = useForm<CostsFormValues>({
    resolver: zodResolver(costsFormSchema),
    defaultValues: {
      customExpenses: [],
    },
  });

  const { register, control, handleSubmit, reset } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'customExpenses',
  });

  useEffect(() => {
    if (savedCosts) {
      reset(savedCosts);
    }
  }, [savedCosts, reset]);

  const onSubmit = (data: CostsFormValues) => {
    if (!costsDocRef || !user) return;
    setDocumentNonBlocking(costsDocRef, { ...data, userId: user.uid, id: user.uid }, { merge: true });
    toast({
      title: 'Custos Salvos!',
      description: 'Suas informações de custos foram salvas com sucesso na nuvem.',
    });
  };
  
  if (isLoading) {
      return (
          <div className="w-full">
            <Card>
                <CardHeader>
                  <Skeleton className="h-8 w-1/3" />
                  <Skeleton className="h-4 w-2/3" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </CardContent>
            </Card>
          </div>
      )
  }

  return (
    <div className="w-full">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Settings />
                Custos Fixos e Variáveis
              </CardTitle>
              <CardDescription>
                Preencha os campos abaixo com os custos e potências dos seus equipamentos. Estes dados serão usados no cálculo do preço de venda.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              
              {/* Cost Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Custos Gerais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(fieldLabels).slice(0, 6).map(([key, value]) =>(
                    <div key={key} className="space-y-2">
                      <Label htmlFor={key}>{value.label} ({value.unit})</Label>
                      <Input id={key} type="number" step="0.01" {...register(key as keyof CostsFormValues)} placeholder={value.description} />
                    </div>
                  ))}
                  <div className="space-y-2">
                    <Label>Botijão de Gás</Label>
                    <RadioGroup {...register('gasCylinderSize')} onValueChange={(val) => form.setValue('gasCylinderSize', val as '8' | '10' | '13')} className="flex items-center space-x-4 pt-2">
                        <div className="flex items-center space-x-2"><RadioGroupItem value="8" id="gas8" /><Label htmlFor="gas8">8kg</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="10" id="gas10" /><Label htmlFor="gas10">10kg</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="13" id="gas13" /><Label htmlFor="gas13">13kg</Label></div>
                    </RadioGroup>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Equipment Power Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Potência de Equipamentos Elétricos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(fieldLabels).slice(6, 12).map(([key, value]) =>(
                    <div key={key} className="space-y-2">
                      <Label htmlFor={key}>{value.label} ({value.unit})</Label>
                      <Input id={key} type="number" step="0.01" {...register(key as keyof CostsFormValues)} placeholder={value.description} />
                    </div>
                  ))}
                </div>
              </div>

              <Separator />
              
              {/* Gas Equipment Flow Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Vazão de Equipamentos a Gás</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(fieldLabels).slice(12, 15).map(([key, value]) =>(
                     <div key={key} className="space-y-2">
                      <Label htmlFor={key}>{value.label} ({value.unit})</Label>
                      <Input id={key} type="number" step="0.001" {...register(key as keyof CostsFormValues)} placeholder={value.description} />
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

               {/* Custom Expenses Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Outras Despesas</h3>
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex flex-col md:flex-row items-end gap-2 p-4 border rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 flex-grow w-full">
                        <div className="space-y-1">
                          <Label htmlFor={`customExpenses.${index}.name`}>Nome da Despesa</Label>
                          <Input {...register(`customExpenses.${index}.name`)} placeholder="Ex: Embalagem" />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`customExpenses.${index}.value`}>Valor (R$)</Label>
                          <Input type="number" step="0.01" {...register(`customExpenses.${index}.value`)} placeholder="Ex: 25.50" />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`customExpenses.${index}.unit`}>Unidade</Label>
                          <Input {...register(`customExpenses.${index}.unit`)} placeholder="Ex: Pacote c/ 100" />
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => remove(index)}
                        className="w-full md:w-auto mt-2 md:mt-0"
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => append({ name: '', value: 0, unit: '' })}
                  className="mt-4"
                >
                  <Plus className="mr-2" />
                  Adicionar Nova Despesa
                </Button>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit">Salvar Alterações</Button>
              </div>
            </CardContent>
          </Card>
        </form>
    </div>
  );
}

    