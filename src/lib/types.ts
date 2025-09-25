export type Unit = 'g' | 'kg' | 'ml' | 'l' | 'un';
export type OperationalUnit = 'min' | 'h' | 'un';

export interface Ingredient {
  id: string;
  name: string;
  cost: number;
  packageSize: number;
  unit: Unit;
  supplier?: string;
  category?: string;
  unitCost?: number;
  lossFactor?: number;
  stockQuantity?: number;
  lowStockThreshold?: number;
  expirationDate?: string; // ISO String
}

export type RecipeItemType = 'ingredient' | 'labor' | 'equipment';

export interface RecipeItem {
  id: string;
  type: RecipeItemType;
  name: string;
  quantity: number;
  unit: Unit | OperationalUnit;
  cost: number;
  // If type is 'ingredient', this will be the ingredient object
  ingredient?: Ingredient;
  // If type is 'equipment', this can hold the equipment key
  equipmentKey?: string;
}


export interface Recipe {
    id: string;
    name:string;
    items: RecipeItem[];
    totalCost?: number;
    suggestedPrice?: number;
}

export type OrderStatus = 'pending' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  customerName: string;
  deliveryDate: string; // ISO string date
  items: {
    recipe: Recipe;
    quantity: number;
  }[];
  total: number;
  status: OrderStatus;
}

export interface Customer {
  id: string;
  name: string;
  cpf?: string;
  address?: string;
  phone?: string;
  instagram?: string;
  lastOrderDate?: string; // ISO String
  crmSuggestion?: string;
}
