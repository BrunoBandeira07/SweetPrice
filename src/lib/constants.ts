
import type { Ingredient, Unit, Order, Recipe, DeliveryStatus, ProductionStatus, Customer } from './types';

export const UNITS: { value: Unit; label: string }[] = [
  { value: 'g', label: 'Gramas (g)' },
  { value: 'kg', label: 'Quilogramas (kg)' },
  { value: 'ml', label: 'Mililitros (ml)' },
  { value: 'l', label: 'Litros (l)' },
  { value: 'un', label: 'Unidades (un)' },
];

export const INITIAL_INGREDIENTS: Omit<Ingredient, 'id' | 'userId'>[] = [
  {
    name: 'Farinha de Trigo',
    packageSize: 1000,
    unit: 'g',
    cost: 5.50,
    supplier: 'Fornecedor A',
    unitCost: 0.0055,
    stockQuantity: 2000,
    lowStockThreshold: 500,
    expirationDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
    category: 'Secos'
  },
  {
    name: 'Açúcar Refinado',
    packageSize: 1000,
    unit: 'g',
    cost: 4.80,
    supplier: 'Fornecedor B',
     unitCost: 0.0048,
     stockQuantity: 1500,
     lowStockThreshold: 500,
     category: 'Secos'
  },
  {
    name: 'Ovos',
    packageSize: 12,
    unit: 'un',
    cost: 10.00,
    supplier: 'Granja Feliz',
     unitCost: 0.8333,
     stockQuantity: 24,
     lowStockThreshold: 12,
     expirationDate: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString(),
     category: 'Frescos'
  },
  {
    name: 'Manteiga Sem Sal',
    packageSize: 200,
    unit: 'g',
    cost: 8.50,
    supplier: 'Laticínios Sul',
    unitCost: 0.0425,
    stockQuantity: 400,
    lowStockThreshold: 200,
    category: 'Laticínios'
  },
  {
    name: 'Chocolate em Pó 50%',
    packageSize: 500,
    unit: 'g',
    cost: 15.00,
    supplier: 'Cacau Show',
    unitCost: 0.03,
    stockQuantity: 100,
    lowStockThreshold: 250,
    category: 'Secos'
  },
   {
    name: 'Leite Condensado',
    packageSize: 395,
    unit: 'g',
    cost: 6.90,
    supplier: 'Laticínios Sul',
    unitCost: 0.0174,
    stockQuantity: 20,
    lowStockThreshold: 10,
    category: 'Laticínios'
  },
];

export const INITIAL_RECIPES: Omit<Recipe, 'id' | 'userId' | 'items'>[] = [
  {
    name: 'Bolo de Chocolate Simples',
    totalCost: 5.89,
    suggestedPrice: 25.00,
    margin: 150,
    marginType: 'percentage',
  },
  {
    name: 'Cento de Brigadeiros',
    totalCost: 28.5,
    suggestedPrice: 120.00,
    margin: 100,
    marginType: 'percentage',
  }
];

export const INITIAL_CUSTOMERS: Omit<Customer, 'id' | 'userId'>[] = [
    {
        name: 'Ana Silva',
        phone: '(11) 99999-8888',
        instagram: '@anasilva',
        lastOrderDate: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
        crmSuggestion: "Oferecer um desconto no próximo Bolo de Chocolate, seu produto favorito."
    },
    {
        name: 'João Costa',
        phone: '(21) 98888-7777',
        lastOrderDate: new Date(new Date().setDate(new Date().getDate() - 25)).toISOString(),
    }
];

export const INITIAL_ORDERS: Omit<Order, 'id' | 'userId'>[] = [
    {
        customerName: 'Ana Silva',
        deliveryDate: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
        items: [], // Will be populated by seed function
        total: 25.00,
        deliveryStatus: 'pending',
        productionStatus: 'producing'
    },
    {
        customerName: 'João Costa',
        deliveryDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
        items: [], // Will be populated by seed function
        total: 120.00,
        deliveryStatus: 'pending',
        productionStatus: 'to_do'
    },
     {
        customerName: 'Mariana Oliveira',
        deliveryDate: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(),
        items: [], // Will be populated by seed function
        total: 50.00,
        deliveryStatus: 'delivered',
        productionStatus: 'ready_for_delivery'
    }
];


export const PRODUCTION_STATUS_MAP: Record<ProductionStatus, { label: string; color: string }> = {
    to_do: { label: "A Fazer", color: "bg-gray-200 text-gray-800" },
    buying_supplies: { label: "Comprando Insumos", color: "bg-blue-200 text-blue-800" },
    producing: { label: "Produção", color: "bg-yellow-200 text-yellow-800" },
    finishing: { label: "Acabamento", color: "bg-purple-200 text-purple-800" },
    ready_for_delivery: { label: "Pronto para Entrega", color: "bg-green-200 text-green-800" },
};
