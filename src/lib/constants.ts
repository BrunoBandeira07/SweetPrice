import type { Ingredient, Unit } from './types';

export const UNITS: { value: Unit; label: string }[] = [
  { value: 'g', label: 'Gramas (g)' },
  { value: 'kg', label: 'Quilogramas (kg)' },
  { value: 'ml', label: 'Mililitros (ml)' },
  { value: 'l', label: 'Litros (l)' },
  { value: 'un', label: 'Unidades (un)' },
];

export const INITIAL_INGREDIENTS: Ingredient[] = [
  {
    id: '1',
    name: 'Farinha de Trigo',
    packageSize: 1000,
    unit: 'g',
    cost: 5.50,
    supplier: 'Fornecedor A',
  },
  {
    id: '2',
    name: 'Açúcar Refinado',
    packageSize: 1000,
    unit: 'g',
    cost: 4.80,
    supplier: 'Fornecedor B',
  },
  {
    id: '3',
    name: 'Ovos',
    packageSize: 12,
    unit: 'un',
    cost: 10.00,
    supplier: 'Granja Feliz',
  },
  {
    id: '4',
    name: 'Manteiga Sem Sal',
    packageSize: 200,
    unit: 'g',
    cost: 8.50,
    supplier: 'Laticínios Sul',
  },
  {
    id: '5',
    name: 'Chocolate em Pó 50%',
    packageSize: 500,
    unit: 'g',
    cost: 15.00,
    supplier: 'Cacau Show',
  },
];
