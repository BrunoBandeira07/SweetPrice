import type { Ingredient, Unit, Order, Recipe } from './types';

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
    unitCost: 0.0055,
    stockQuantity: 2000,
    lowStockThreshold: 500,
    expirationDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
  },
  {
    id: '2',
    name: 'Açúcar Refinado',
    packageSize: 1000,
    unit: 'g',
    cost: 4.80,
    supplier: 'Fornecedor B',
     unitCost: 0.0048,
     stockQuantity: 1500,
     lowStockThreshold: 500,
  },
  {
    id: '3',
    name: 'Ovos',
    packageSize: 12,
    unit: 'un',
    cost: 10.00,
    supplier: 'Granja Feliz',
     unitCost: 0.8333,
     stockQuantity: 24,
     lowStockThreshold: 12,
     expirationDate: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString(),
  },
  {
    id: '4',
    name: 'Manteiga Sem Sal',
    packageSize: 200,
    unit: 'g',
    cost: 8.50,
    supplier: 'Laticínios Sul',
    unitCost: 0.0425,
    stockQuantity: 400,
    lowStockThreshold: 200,
  },
  {
    id: '5',
    name: 'Chocolate em Pó 50%',
    packageSize: 500,
    unit: 'g',
    cost: 15.00,
    supplier: 'Cacau Show',
    unitCost: 0.03,
    stockQuantity: 100,
    lowStockThreshold: 250,
  },
];

const MOCK_RECIPE_1: Recipe = {
  id: 'rec1',
  name: 'Bolo de Chocolate',
  items: [
    { id: 'i1', type: 'ingredient', name: 'Farinha de Trigo', quantity: 250, unit: 'g', cost: 1.375, ingredient: INITIAL_INGREDIENTS[0] },
    { id: 'i2', type: 'ingredient', name: 'Açúcar Refinado', quantity: 200, unit: 'g', cost: 0.96, ingredient: INITIAL_INGREDIENTS[1] },
    { id: 'i3', type: 'ingredient', name: 'Ovos', quantity: 3, unit: 'un', cost: 2.5, ingredient: INITIAL_INGREDIENTS[2] },
  ],
  totalCost: 4.835,
  suggestedPrice: 15.00
};

const MOCK_RECIPE_2: Recipe = {
  id: 'rec2',
  name: 'Brigadeiro (Cento)',
  items: [
     { id: 'i4', type: 'ingredient', name: 'Chocolate em Pó 50%', quantity: 100, unit: 'g', cost: 3.00, ingredient: INITIAL_INGREDIENTS[4] },
  ],
  totalCost: 3.00,
  suggestedPrice: 120.00
};


export const INITIAL_ORDERS: Order[] = [
    {
        id: '1',
        customerName: 'Ana Silva',
        deliveryDate: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
        items: [{ recipe: MOCK_RECIPE_1, quantity: 1 }],
        total: 15.00,
        status: 'pending'
    },
    {
        id: '2',
        customerName: 'João Costa',
        deliveryDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
        items: [{ recipe: MOCK_RECIPE_2, quantity: 2 }],
        total: 240.00,
        status: 'pending'
    },
     {
        id: '3',
        customerName: 'Mariana Oliveira',
        deliveryDate: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(),
        items: [{ recipe: MOCK_RECIPE_1, quantity: 2 }],
        total: 30.00,
        status: 'delivered'
    }
];
