

export type Unit = 'g' | 'kg' | 'ml' | 'l' | 'un';

export interface Ingredient {
  id: string;
  userId: string;
  name: string;
  cost: number; // Cost of the entire package
  packageSize: number; // e.g., 1000 for 1kg
  unit: Unit;
  supplier?: string;
  unitCost?: number; // Calculated: cost / packageSize
  stockQuantity?: number; // Current quantity in stock
  lowStockThreshold?: number; // Threshold to trigger a warning
  expirationDate?: string; // ISO string for expiration date
  category?: string;
  lossFactor?: number;
}

export type RecipeItemType = 'ingredient' | 'labor' | 'equipment';

export interface RecipeItem {
  id: string;
  type: RecipeItemType;
  name: string;
  quantity: number;
  unit: string;
  cost: number;
  ingredient?: Ingredient; // Only if type is 'ingredient'
}


export interface Recipe {
    id: string;
    userId: string;
    name:string;
    items: RecipeItem[];
    totalCost: number;
    suggestedPrice: number;
    margin: number;
    marginType: 'percentage' | 'fixed';
}

export interface Customer {
  id: string;
  userId: string;
  name: string;
  cpf?: string;
  address?: string;
  phone?: string;
  instagram?: string;
  lastOrderDate?: string;
  crmSuggestion?: string;
}

export type ProductionStatus = 'to_do' | 'buying_supplies' | 'producing' | 'finishing' | 'ready_for_delivery';
export type DeliveryStatus = 'pending' | 'delivered' | 'cancelled';
export type CampaignStatus = 'planning' | 'in_progress' | 'completed' | 'archived';

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  deliveryDate: string; // ISO String
  items: {
    recipe: Pick<Recipe, 'id' | 'name' | 'suggestedPrice'>;
    quantity: number;
  }[];
  total: number;
  deliveryStatus: DeliveryStatus;
  productionStatus: ProductionStatus;
}


export interface CampaignTask {
    id: string;
    text: string;
    completed: boolean;
}

export interface Campaign {
    id: string;
    userId: string;
    name: string;
    status: CampaignStatus;
    startDate: string; // ISO String
    endDate: string; // ISO String
    tasks: CampaignTask[];
}

export interface UserSettings {
    id: string;
    userId: string;
    monthlyGoal?: number;
}

    