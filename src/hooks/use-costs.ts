
"use client";
import { useState, useEffect, useMemo } from 'react';
import { z } from 'zod';
import { useUser, useFirestore, useMemoFirebase } from "@/firebase/provider";
import { doc } from 'firebase/firestore';
import { useDoc } from '@/firebase/firestore/use-doc';

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

type Equipment = { label: string; value: number | undefined, unit: 'Watts' | 'kg/h' };
type Equipments = Record<string, Equipment>;

export const useCosts = () => {
    const { user } = useUser();
    const firestore = useFirestore();
    const costsDocRef = useMemoFirebase(() => {
      if (!user || !firestore) return null;
      return doc(firestore, 'costs', user.uid)
    }, [firestore, user]);
    const { data: costs = {} as CostsFormValues } = useDoc<CostsFormValues>(costsDocRef);

    const electricEquipments: Equipments = useMemo(() => ({
        microwavePower: { label: 'Micro-ondas', value: costs.microwavePower, unit: 'Watts' },
        blenderPower: { label: 'Liquidificador', value: costs.blenderPower, unit: 'Watts' },
        mixerPower: { label: 'Batedeira', value: costs.mixerPower, unit: 'Watts' },
        electricOvenPower: { label: 'Forno Elétrico', value: costs.electricOvenPower, unit: 'Watts' },
        brigadeiroPanPower: { label: 'Panela de Brigadeiro', value: costs.brigadeiroPanPower, unit: 'Watts' },
        fryerPower: { label: 'Fritadeira Elétrica', value: costs.fryerPower, unit: 'Watts' },
    }), [costs]);

    const gasEquipments: Equipments = useMemo(() => ({
        gasFryerFlow: { label: 'Fritadeira a Gás', value: costs.gasFryerFlow, unit: 'kg/h' },
        stoveBurnerFlow: { label: 'Boca do Fogão', value: costs.stoveBurnerFlow, unit: 'kg/h' },
        gasOvenFlow: { label: 'Forno a Gás', value: costs.gasOvenFlow, unit: 'kg/h' },
    }), [costs]);

    return { costs, electricEquipments, gasEquipments };
}
