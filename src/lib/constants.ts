
import type { Customer, Ingredient, Order, Recipe, Unit, ProductionStatus } from './types';

export const UNITS: { value: Unit; label: string }[] = [
  { value: 'g', label: 'Gramas (g)' },
  { value: 'kg', label: 'Quilogramas (kg)' },
  { value: 'ml', label: 'Mililitros (ml)' },
  { value: 'l', label: 'Litros (l)' },
  { value: 'un', label: 'Unidades (un)' },
];

export const PRODUCTION_STATUS_MAP: Record<ProductionStatus, { label: string, color: string }> = {
  to_do: { label: 'A fazer', color: 'bg-gray-200' },
  buying_supplies: { label: 'Comprando insumos', color: 'bg-blue-200' },
  producing: { label: 'Produzindo', color: 'bg-yellow-200' },
  finishing: { label: 'Finalizando', color: 'bg-orange-200' },
  ready_for_delivery: { label: 'Pronto para entrega', color: 'bg-green-200' },
};

// Dados iniciais para novos usuários
export const INITIAL_INGREDIENTS: Omit<Ingredient, 'id' | 'userId'>[] = [
  { name: 'Farinha de Trigo', cost: 5, packageSize: 1000, unit: 'g', unitCost: 0.005 },
  { name: 'Açúcar Refinado', cost: 4, packageSize: 1000, unit: 'g', unitCost: 0.004 },
  { name: 'Ovos', cost: 10, packageSize: 12, unit: 'un', unitCost: 0.83 },
  { name: 'Manteiga Sem Sal', cost: 8, packageSize: 200, unit: 'g', unitCost: 0.04 },
  { name: 'Chocolate em Pó 50%', cost: 15, packageSize: 500, unit: 'g', unitCost: 0.03 },
  { name: 'Leite Condensado', cost: 6, packageSize: 395, unit: 'g', unitCost: 0.015 },
];

export const INITIAL_RECIPES: Omit<Recipe, 'id' | 'userId' | 'items'>[] = [
    { name: 'Bolo de Chocolate Simples', totalCost: 8.5, suggestedPrice: 25.00 },
    { name: 'Cento de Brigadeiros', totalCost: 20, suggestedPrice: 80.00 },
];

export const INITIAL_CUSTOMERS: Omit<Customer, 'id' | 'userId'>[] = [
    { name: 'Ana Costa', phone: '(11) 99999-1111', instagram: '@anacosta' },
    { name: 'Bruno Lima', phone: '(21) 98888-2222', instagram: '@brunolima' },
    { name: 'Mariana Oliveira', phone: '(31) 97777-3333', instagram: '@mariana.oli' },
];

export const INITIAL_ORDERS: Omit<Order, 'id' | 'userId' | 'items'>[] = [
    { customerName: 'Ana Costa', deliveryDate: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString(), total: 25.00, deliveryStatus: 'pending', productionStatus: 'to_do' },
    { customerName: 'Bruno Lima', deliveryDate: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(), total: 80.00, deliveryStatus: 'delivered', productionStatus: 'finishing' },
    { customerName: 'Mariana Oliveira', deliveryDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(), total: 50.00, deliveryStatus: 'pending', productionStatus: 'producing' },
];
